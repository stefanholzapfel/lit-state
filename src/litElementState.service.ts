import {DeepPartial} from 'ts-essentials';
import {
    CacheHandler, CheckedStatePath, GetStateOptions, SetStateOptions,
    StateChange,
    StateConfig, StatePath, StatePathConstraint, StatePathValue,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index.js';
import {LitElementStateSubscription} from './litElementStateSubscription.js';
import {
    deepCompare, deepCopy,
    isExceptionFromDeepReduce,
    isObject,
    subscribeOptionsFromDefaultOrParams
} from './litElementState.helpers.js';

export class LitElementStateService<State> {
    private static _globalInstance: any;
    config: StateConfig<State>;
    private stateSubscriptions: LitElementStateSubscription<any>[] = [];
    private cacheHandlers: Map<string, CacheHandler<State>> = new Map();

    constructor(
        initialState?: State,
        config?: StateConfig<State>
    ) {
        this.config = {
            global: !!config?.global,
            defaultSubscribeOptions: {
                getInitialValue: true,
                pushNestedChanges: false,
                getDeepCopy: false,
                autoUnsubscribe: true,
                ...config?.defaultSubscribeOptions
            },
            ...config!.cache && {cache: config!.cache}
        }

        this.config?.cache?.handlers.forEach(cacheHandler => {
            this.cacheHandlers.set(cacheHandler.name, cacheHandler);
            initialState = this.deepReduce(initialState!, cacheHandler.load(this));
        })

        if (this.config.global) {
            LitElementStateService._globalInstance = this;
        }

        this._state = initialState!;
    }

    private _state: State;

    get state(): State {
        return this._state;
    };

    static getGlobalInstance<State>(): LitElementStateService<State> {
        return LitElementStateService._globalInstance;
    }

    // Overload
    subscribe<const P extends StatePathConstraint<State>>(
        path: CheckedStatePath<State, P>,
        subscriptionFunction: StateSubscriptionFunction<StatePathValue<State, P>>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<StatePathValue<State, P>>;
    // Implementation
    subscribe<Part>(
        path: any, // loose on purpose: the public overload types the path
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<Part> {
        options = subscribeOptionsFromDefaultOrParams(options, this);
        const subscription = new LitElementStateSubscription<Part>(
            path,
            subscriptionFunction,
            this.unsubscribe.bind(this),
            options
        );
        subscription.next(
            this.getStateData(
                subscription.path,
                this._state
            ) as Part, true
        );
        this.stateSubscriptions.push(subscription);
        return subscription;
    }

    private unsubscribe(subscription: LitElementStateSubscription<any>) {
        const subIndex = this.stateSubscriptions.indexOf(subscription);
        if (subIndex >= 0) {
            this.stateSubscriptions.splice(
                subIndex,
                1
            );
        } else {
            throw new Error(`Already unsubscribed ${subscription.path}!`);
        }
    }

    // Overload
    get<const P extends StatePathConstraint<State>>(
        path: CheckedStatePath<State, P>,
        options?: GetStateOptions
    ): StatePathValue<State, P>;
    // Implementation
    get<Part>(
        path: any, // loose on purpose: the public overload types the path
        options?: GetStateOptions
    ): Part {
        options = subscribeOptionsFromDefaultOrParams(options, this);
        const part = this.getStateData(
            path,
            this._state
        ) as Part;
        return options?.getDeepCopy ? deepCopy(part) : part;
    }

    getUntyped<Part>(
        path: StatePath<State>,
        options?: GetStateOptions
    ): Part {
        options = subscribeOptionsFromDefaultOrParams(options, this);
        const part = this.getStateData(
            path,
            this._state
        ) as Part;
        return options?.getDeepCopy ? deepCopy(part) : part;
    }

    // Overload: with a typed entry path — the path is validated/suggested like
    // subscription paths and statePartial is checked against the value at the
    // path's end (plain value or a StateChange of it).
    set<const P extends StatePathConstraint<State>>(
        statePartial: StatePathValue<State, P> | StateChange<StatePathValue<State, P>>,
        options: SetStateOptions<State> & { entryPath: CheckedStatePath<State, P> }
    ): void;
    // Overload: whole-state change. `Omit` makes literals with an entryPath fail
    // this overload (excess property), so they are typed by the overload above;
    // pre-built option objects (non-fresh) still match for backward compatibility.
    set<TargetedState = State>(
        statePartial: StateChange<TargetedState>,
        options?: Omit<SetStateOptions<State>, 'entryPath'>
    ): void;
    set(
        statePartial: any,
        options?: SetStateOptions<State>
    ) {
        let stateChange = statePartial as StateChange<State>;
        if (options?.entryPath) {
            let _statePartial = {} as any;
            let currentProperty = _statePartial;
            for (const [index, segment] of options.entryPath.entries()) {
                if (typeof segment === 'string') {
                    currentProperty[segment] = index < options.entryPath.length - 1 ? {} : statePartial;
                    currentProperty = currentProperty[segment];
                } else if (typeof segment === 'object' && !Array.isArray(segment) && segment.hasOwnProperty('array') && segment.hasOwnProperty('get') ) {
                    currentProperty[segment.array] = {
                        _arrayOperation: {
                            op: 'update',
                            at: segment.get,
                            val: index < options.entryPath.length - 1 ? {} : statePartial
                        }
                    };
                    currentProperty = currentProperty[segment.array]['_arrayOperation']['val'];
                } else {
                    throw new Error('A segment of the entry path is neither a string nor an ArrayElementSelector!')
                }
            }
            stateChange = _statePartial as StateChange<State>;
        }
        this.deepReduce(
            this._state,
            stateChange
        );
        if (options?.cacheHandlerName) {
            const cacheHandler = this.cacheHandlers.get(options.cacheHandlerName);
            if (!cacheHandler) {
                console.error(`lit-state: A cache handler with name ${options.cacheHandlerName} was not registered! This set call will not be persisted!`)
            } else {
                cacheHandler.set(stateChange, this);
            }
        }
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription);
        }
    };

    private checkSubscriptionChange(subscription: LitElementStateSubscription<any>) {
        const newValue = this.getStateData(
            subscription.path,
            this._state
        );
        if (newValue !== subscription.value ||
            ((newValue !== null && newValue !== undefined && subscription.subscriptionOptions.pushNestedChanges) && !deepCompare(newValue, subscription.valueDeepCopy))) {
            subscription.next(newValue);
        }
    }

    private getStateData(
        subscriptionPath: StatePath<State>,
        state: State
    ): DeepPartial<State> | undefined {
        let partial = state as any;
        for (let [index, segment] of subscriptionPath.entries()) {
            const isLastSegmentInPath = index === subscriptionPath.length - 1;
            if ((typeof segment === 'object') && segment.hasOwnProperty('array') && segment.hasOwnProperty('get')) {
                if (Array.isArray(partial[segment.array]) && !isLastSegmentInPath)
                    typeof segment['get'] === 'number'?
                        partial = partial[segment.array][segment.get] :
                        partial = partial[segment.array].find(segment.get);
                else if (Array.isArray(partial[segment.array]) && isLastSegmentInPath)
                    return typeof segment['get'] === 'number' ?
                        partial[segment.array][segment.get] :
                        partial[segment.array].find(segment.get);
                else
                    return undefined;
            } else if (typeof segment === 'string') {
                if (!!partial && segment in partial && !isLastSegmentInPath)
                    partial = partial[segment];
                else if (!!partial && segment in partial && isLastSegmentInPath)
                    return partial[segment];
                else
                    return undefined;
            } else
                return undefined;
        }
    }

    private deepReduce(state: any, change: any) {
        for (const key in change as any) {
            // Handle array operators
            if (isObject(change[key]) && '_arrayOperation' in change[key]) {
                if (!state[key]) {
                    state[key] = [] as any;
                }
                const arrayOperation = change[key]._arrayOperation;
                if (arrayOperation.op === 'update') {
                    const valIsFunction = arrayOperation.val && arrayOperation.val instanceof Function;
                    if (typeof arrayOperation.at === 'number') {
                        const val = valIsFunction ? arrayOperation.val(state[key][arrayOperation.at]) : arrayOperation.val;
                        const reducerMode = val._reducerMode;
                        delete val._reducerMode;
                        if (!reducerMode || reducerMode === 'merge') {
                            this.deepReduce(state[key][arrayOperation.at], val);
                        } else {
                            state[key][arrayOperation.at] = val;
                        }
                    } else if (arrayOperation.at instanceof Function) {
                        const indices: number[] = []
                        state[key].forEach((elem: any, index: number) => {
                           if ([elem].find(arrayOperation.at)) indices.push(index);
                        });
                        indices.forEach(index => {
                            const val = valIsFunction ? arrayOperation.val(state[key][index]) : arrayOperation.val;
                            const reducerMode = val._reducerMode;
                            delete val._reducerMode;
                            if (!reducerMode || reducerMode === 'merge') {
                                this.deepReduce(state[key][index], val);
                            } else {
                                state[key][index] = val;
                            }
                        });
                    }
                } else if (arrayOperation.op === 'push') {
                    if (typeof arrayOperation.at === 'number') {
                        (state[key] as any[]).splice(arrayOperation.at, 0, change[key]._arrayOperation.val);
                    } else {
                        (state[key] as any[]).push(change[key]._arrayOperation.val);
                    }
                } else if (arrayOperation.op === 'pull') {
                    if (typeof arrayOperation.at === 'number') {
                        (state[key] as any[]).splice(arrayOperation.at, 1);
                    } else if (arrayOperation.at instanceof Function) {
                        let index = (state[key] as any[]).findIndex(arrayOperation.at);
                        while (index >= 0) {
                            (state[key] as any[]).splice(index, 1);
                            index = (state[key] as any[]).findIndex(arrayOperation.at);
                        }
                    } else {
                        (state[key] as any[]).pop();
                    }
                }
            } else if (isObject(change[key]) && !Array.isArray(change[key]) && !(isExceptionFromDeepReduce(change[key])) &&
                // Handle object merging
                (!('_reducerMode' in change[key]) || change[key]._reducerMode === 'merge')) {
                delete change[key]._reducerMode;
                if (!state[key]) {
                    Object.assign(
                        state,
                        {[key]: {}}
                    );
                }
                this.deepReduce(
                    state[key],
                    change[key]
                );
            } else {
                // Handle replacements
                if (!change[key]?._reducerMode) {
                    state[key] = change[key];
                } else {
                    const _reducerMode = change[key]._reducerMode;
                    delete change[key]._reducerMode;
                    Object.assign(
                        state,
                        {[key]: {...change[key]}}
                    );
                    // Need to reassign reducer mode here, otherwise it might be lost for array's succeeding while loop iterations!
                    change[key]._reducerMode = _reducerMode;
                }
            }
        }
        return state;
    }
}
