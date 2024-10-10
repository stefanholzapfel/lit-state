import {DeepPartial} from 'ts-essentials';
import {
    ArrayElementSelector,
    CacheHandler, GetStateOptions, SetStateOptions,
    StateChange,
    StateConfig, StatePath,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {
    deepCompare, deepCopy,
    isExceptionFromDeepReduce,
    isObject,
    subscribeOptionsFromDefaultOrParams
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

    // Overloads
    subscribe<K1 extends keyof State,
        T1 extends State[K1]>(
        path: readonly [ State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribe<K1 extends keyof State,
        T1 extends State[K1]>(
        path: readonly [ K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T1[K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1[K2]>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3
        ],
        subscriptionFunction: StateSubscriptionFunction<T3>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T3>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            K3
        ],
        subscriptionFunction: StateSubscriptionFunction<T2[K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2[K3]>;
    subscribe<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4
        ],
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
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            K4
        ],
        subscriptionFunction: StateSubscriptionFunction<T3[K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T3[K4]>;
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
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5
        ],
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
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            K5
        ],
        subscriptionFunction: StateSubscriptionFunction<T4[K5]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T4[K5]>;
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
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6
        ],
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            K6
        ],
        subscriptionFunction: StateSubscriptionFunction<T5[K6]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T5[K6]>;
    // Implementation
    subscribe<Part>(
        path: StatePath<State>,
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

    // Overloads
    get<K1 extends keyof State,
        T1 extends State[K1]>(
        path: readonly [ State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1 ],
        options?: GetStateOptions
    ): T1;
    get<K1 extends keyof State,
        T1 extends State[K1]>(
        path: readonly [ K1 ],
        options?: GetStateOptions
    ): T1;
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2
        ],
        options?: GetStateOptions
    ): T2;
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            K2
        ],
        options?: GetStateOptions
    ): T1[K2];
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3
        ],
        options?: GetStateOptions
    ): T3;
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            K3
        ],
        options?: GetStateOptions
    ): T2[K3];
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4
        ],
        options?: GetStateOptions
    ): T4;
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            K4
        ],
        options?: GetStateOptions
    ): T3[K4];
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        path: readonly  [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5
        ],
        options?: GetStateOptions
    ): T5;
    get<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        path: readonly  [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            K5
        ],
        options?: GetStateOptions
    ): T4[K5];
    get<K1 extends keyof State,
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
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6
        ],
        options?: GetStateOptions
    ): T6;
    get<K1 extends keyof State,
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
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            K6
        ],
        options?: GetStateOptions
    ): T5[K6];
    get<K1 extends keyof State,
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6]),
        K7 extends keyof T6,
        T7 extends (T6[K7] extends Array<any> ? T6[K7][number] : T6[K7])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6,
            T6[K7] extends Array<any> ? ArrayElementSelector<K7, T7> : K7
        ],
        options?: GetStateOptions
    ): T7;
    get<K1 extends keyof State,
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6]),
        K7 extends keyof T6,
        T7 extends (T6[K7] extends Array<any> ? T6[K7][number] : T6[K7])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6,
            K7
        ],
        options?: GetStateOptions
    ): T6[K7];
    get<K1 extends keyof State,
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6]),
        K7 extends keyof T6,
        T7 extends (T6[K7] extends Array<any> ? T6[K7][number] : T6[K7]),
        K8 extends keyof T7,
        T8 extends (T7[K8] extends Array<any> ? T7[K8][number] : T7[K8])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6,
            T6[K7] extends Array<any> ? ArrayElementSelector<K7, T7> : K7,
            T7[K8] extends Array<any> ? ArrayElementSelector<K8, T8> : K8
        ],
        options?: GetStateOptions
    ): T8;
    get<K1 extends keyof State,
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6]),
        K7 extends keyof T6,
        T7 extends (T6[K7] extends Array<any> ? T6[K7][number] : T6[K7]),
        K8 extends keyof T7,
        T8 extends (T7[K8] extends Array<any> ? T7[K8][number] : T7[K8])>(
        path: readonly [
            State[K1] extends Array<any> ? ArrayElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArrayElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArrayElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArrayElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArrayElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArrayElementSelector<K6, T6> : K6,
            T6[K7] extends Array<any> ? ArrayElementSelector<K7, T7> : K7,
            K8
        ],
        options?: GetStateOptions
    ): T7[K8];
    // Implementation
    get<Part>(
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

    set<TargetedState = State>(
        statePartial: StateChange<TargetedState>,
        options?: SetStateOptions<State>
    ): void {
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
        let partial = state as object;
        for (let [index, segment] of subscriptionPath.entries()) {
            const isLastSegmentInPath = index === subscriptionPath.length - 1;
            if ((typeof segment === 'object') && segment.hasOwnProperty('array')) {
                if (Array.isArray(partial[segment.array]) && !isLastSegmentInPath)
                    partial = partial[segment.array].find(segment.get);
                else if (Array.isArray(partial[segment.array]) && isLastSegmentInPath)
                    return partial[segment.array].find(segment.get);
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
