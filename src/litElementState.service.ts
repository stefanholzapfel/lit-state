import {DeepPartial} from 'ts-essentials';
import {
    ArraySubscriptionPredicate,
    CacheHandler, PredicateFunction,
    StateChange,
    StateConfig,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {
    deepCompare,
    isExceptionFromDeepReduce,
    isObject,
    optionsFromDefaultOrParams
} from './litElementState.helpers';

export class LitElementStateService<State> {
    private static _globalInstance;
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

    static getGlobalInstance<State>(): LitElementStateService<State> {
        return LitElementStateService._globalInstance;
    }

    // TODO: autocomplete for path segments (k1 - k6) not working anymore (due to T "extends" condition?)
    // Overloads
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribe<K1 extends keyof State,
        T1 extends State[K1]>(
        k1: K1,
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends T1[K2]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: K2,
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        subscriptionFunction: StateSubscriptionFunction<T3>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T3>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends T2[K3]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: K3,
        subscriptionFunction: StateSubscriptionFunction<T3>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T3>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
        subscriptionFunction: StateSubscriptionFunction<T4>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T4>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends T3[K4]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: K4,
        subscriptionFunction: StateSubscriptionFunction<T4>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T4>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5,
        subscriptionFunction: StateSubscriptionFunction<T5>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T5>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends T4[K5]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
        k5: K5,
        subscriptionFunction: StateSubscriptionFunction<T5>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T5>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5]),
        K6 extends keyof T5,
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5,
        k6: T5[K6] extends Array<any> ? ArraySubscriptionPredicate<K6, T6> : K6,
        subscriptionFunction: StateSubscriptionFunction<T6>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T6>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5]),
        K6 extends keyof T5,
        T6 extends T5[K6]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5,
        k6: K6,
        subscriptionFunction: StateSubscriptionFunction<T6>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T6>;
    // Implementation
    subscribe<Part>(
        ...params: (string | ArraySubscriptionPredicate<string, any> | StateSubscriptionFunction<Part> | SubscribeStateOptions)[]
    ): LitElementStateSubscription<Part> {
        const options = optionsFromDefaultOrParams(params, this);
        const subscriptionFunction = params.pop() as StateSubscriptionFunction<Part>;
        const subscription = new LitElementStateSubscription<Part>(
            params as any,
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

    set(statePartial: StateChange<State>, cacheHandlerName?: string): void {
        if (cacheHandlerName) {
            const cacheHandler = this.cacheHandlers.get(cacheHandlerName);
            if (!cacheHandler) {
                console.error(`lit-state: A cache handler with name ${cacheHandlerName} was not registered! This set call will not be persisted!`)
            } else {
                cacheHandler.set(statePartial, this);
            }
        }
        this.deepReduce(
            this._state,
            statePartial
        );
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription);
        }
    };

    setStateInPath<EntityTypeInPath>(path: (string | number | PredicateFunction<any>)[], change: StateChange<EntityTypeInPath>) {
        let statePartial = {};
        let currentProperty = statePartial;
        for (const [index, segment] of path) {
            if (typeof segment === 'string') {
                currentProperty[segment] = index < path.length - 1 ? {} : change;
                currentProperty = currentProperty[segment];
            } else if (typeof segment === 'number' || segment instanceof Function) {
                currentProperty['_arrayOperation'] = {
                    op: 'update',
                    at: segment,
                    val: index < path.length - 1 ? {} : change
                };
                currentProperty = currentProperty['_arrayOperation']['val'];
            }
        }
        this.set(statePartial);
    }

    private checkSubscriptionChange(subscription: LitElementStateSubscription<any>) {
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
        subscriptionPath: (string | ArraySubscriptionPredicate<string, any>)[],
        state: State
    ): DeepPartial<State> {
        let partial = state as object;
        for (let [index, segment] of subscriptionPath.entries()) {
            const isLastSegmentInPath = index === subscriptionPath.length - 1;
            if ((typeof segment === 'object') && segment.hasOwnProperty('array')) {
                if (Array.isArray(partial[segment.array]) && !isLastSegmentInPath)
                    partial = partial[segment.array].find(segment.predicate);
                else if (Array.isArray(partial[segment.array]) && isLastSegmentInPath)
                    return partial[segment.array].find(segment.predicate);
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

    private deepReduce(state: State, change: StateChange<State> | DeepPartial<StateChange<State>>) {
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
                        let indx = (state[key] as any[]).findIndex(arrayOperation.at);
                        while (indx >= 0) {
                            (state[key] as any[]).splice(indx, 1);
                            indx = (state[key] as any[]).findIndex(arrayOperation.at);
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
