import {DeepPartial} from 'ts-essentials';
import {
    CacheHandler, SetStateOptions,
    StateChange,
    StateConfig, StatePath, StatePathKey,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {
    deepCompare,
    isExceptionFromDeepReduce,
    isObject,
    subscribeOptionsFromDefaultOrParams
} from './litElementState.helpers';

export class LitElementStateService<State> {
    private static _globalInstance;
    config: StateConfig<State>;
    private stateSubscriptions: LitElementStateSubscription<State, any>[] = [];
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
            ...config.cache && {cache: config.cache}
        }

        this.config?.cache?.handlers.forEach(cacheHandler => {
            this.cacheHandlers.set(cacheHandler.name, cacheHandler);
            initialState = this.deepReduce(initialState, cacheHandler.load(this));
        })

        if (this.config.global) {
            LitElementStateService._globalInstance = this;
        }

        this._state = initialState;
    }

    private _state: State;

    get state(): State {
        return this._state;
    };

    static getGlobalInstance<State>() {
        return LitElementStateService._globalInstance;
    }

    subscribe<Part>(
        path: StatePath<State>,
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateOptions
    ) {
        options = subscribeOptionsFromDefaultOrParams(options, this);
        const subscription = new LitElementStateSubscription<State, Part>(
            path,
            subscriptionFunction,
            this.unsubscribe.bind(this),
            options
        );
        subscription.next(
            this.getSubscriptionData(
                subscription.path,
                this._state
            ) as Part, true
        );
        this.stateSubscriptions.push(subscription);
        return subscription;
    }

    private unsubscribe(subscription: LitElementStateSubscription<State, any>) {
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

    set<TargetedState = State>(
        statePartial: StateChange<TargetedState>,
        options?: SetStateOptions<State>
    ) {
        let stateChange = statePartial as StateChange<State>;
        const entryPath = options?.entryPath as StatePathKey[];
        if (entryPath) {
            let _statePartial = {} as any;
            let currentProperty = _statePartial;
            for (const [index, segment] of entryPath.entries()) {
                if (typeof segment === 'string') {
                    currentProperty[segment] = index < entryPath.length - 1 ? {} : statePartial;
                    currentProperty = currentProperty[segment];
                } else if (typeof segment === 'number' || segment instanceof Function) {
                    currentProperty['_arrayOperation'] = {
                        op: 'update',
                        at: segment,
                        val: index < entryPath.length - 1 ? {} : statePartial
                    };
                    currentProperty = currentProperty['_arrayOperation']['val'];
                }
            }
            stateChange = _statePartial as StateChange<State>;
        }
        if (options?.cacheHandlerName) {
            const cacheHandler = this.cacheHandlers.get(options.cacheHandlerName);
            if (!cacheHandler) {
                console.error(`lit-state: A cache handler with name ${options.cacheHandlerName} was not registered! This set call will not be persisted!`)
            } else {
                cacheHandler.set(stateChange, this);
            }
        }
        this.deepReduce(
            this._state,
            stateChange
        );
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription);
        }
    };

    private checkSubscriptionChange(subscription: LitElementStateSubscription<State, any>) {
        const newValue = this.getSubscriptionData(
            subscription.path,
            this._state
        );
        if (newValue !== subscription.value ||
            ((newValue !== null && newValue !== undefined && subscription.subscriptionOptions.pushNestedChanges) && !deepCompare(newValue, subscription.valueDeepCopy))) {
            subscription.next(newValue);
        }
    }

    private getSubscriptionData(
        subscriptionPath: StatePath<State>,
        state: State
    ): DeepPartial<State> {
        let partial = state as object;
        for (let [index, segment] of (subscriptionPath as StatePathKey[]).entries()) {
            const isLastSegmentInPath = index === (subscriptionPath as StatePathKey[]).length - 1;
            if ((typeof segment === 'number') && segment.hasOwnProperty('array')) {
                if (Array.isArray(partial) && partial[segment] && !isLastSegmentInPath)
                    partial = partial[segment];
                else if (Array.isArray(partial) && partial[segment] && isLastSegmentInPath)
                    return partial[segment];
                else
                    return undefined;
            }  else if (typeof segment === 'function') {
                if (Array.isArray(partial) && !isLastSegmentInPath)
                    partial = partial.find(segment);
                else if (Array.isArray(partial) && isLastSegmentInPath)
                    return partial.find(segment);
                else
                    return undefined;
            } else if (typeof segment === 'string') {
                if (!!partial && segment in partial && !isLastSegmentInPath)
                    partial = partial[segment];
                else if (!!partial && segment in partial && isLastSegmentInPath)
                    return partial[segment];
                else
                    return undefined;
            }
        }
    }

    private deepReduce(state: State, change: StateChange<State>) {
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
                        const indices = []
                        state[key].forEach((elem, index) => {
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
