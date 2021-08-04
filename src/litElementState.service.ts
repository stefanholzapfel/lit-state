import {DeepPartial} from 'ts-essentials';
import {
    ArrayElement,
    CacheHandler, PredicateFunction,
    ReducableState,
    StateConfig,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {isExceptionFromDeepReduce, isObject, optionsFromDefaultOrParams} from './litElementState.helpers';

export class LitElementStateService<State> {
    private static _globalInstance;
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
            ...config.cache && { cache: config.cache }
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

    static getGlobalInstance(): LitElementStateService<any> {
        return LitElementStateService._globalInstance;
    }

    config: StateConfig<State>;

    set(statePartial: DeepPartial<ReducableState<State>>, cacheHandlerName?: string): void {
        if (cacheHandlerName) {
            const cacheHandler = this.cacheHandlers.get(cacheHandlerName);
            if (!cacheHandler) {
                console.error(`lit-state: A cache handler with name ${ cacheHandlerName } was not registered! This set call will not be persisted!`)
            } else {
                cacheHandler.set(statePartial, this);
            }
        }
        this.deepReduce(
            this._state,
            statePartial
        );
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription, statePartial);
        }
    };

    // Overloads
    subscribe<K1 extends keyof State>(
        k1: K1,
        subscriptionFunction: StateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: State[K1] extends Array<ArrayElement<State[K1]>> ? PredicateFunction<ArrayElement<State[K1]>> | number : K2,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: State[K1] extends Array<ArrayElement<State[K1]>> ? PredicateFunction<ArrayElement<State[K1]>> | number : K2,
        k3: State[K1][K2] extends Array<ArrayElement<State[K1][K2]>> ? PredicateFunction<ArrayElement<State[K1][K2]>> | number : K3,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1,
        k2: State[K1] extends Array<ArrayElement<State[K1]>> ? PredicateFunction<ArrayElement<State[K1]>> | number : K2,
        k3: State[K1][K2] extends Array<ArrayElement<State[K1][K2]>> ? PredicateFunction<ArrayElement<State[K1][K2]>> | number : K3,
        k4: State[K1][K2][K3] extends Array<ArrayElement<State[K1][K2][K3]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3]>> | number : K4,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    // TODO: FIX TYPING (SEE LIT-STARTER ERROR)
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4]>(
        k1: K1,
        k2: State[K1] extends Array<ArrayElement<State[K1]>> ? PredicateFunction<ArrayElement<State[K1]>> | number : K2,
        k3: State[K1][K2] extends Array<ArrayElement<State[K1][K2]>> ? PredicateFunction<ArrayElement<State[K1][K2]>> | number : K3,
        k4: State[K1][K2][K3] extends Array<ArrayElement<State[K1][K2][K3]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3]>> | number : K4,
        k5: State[K1][K2][K3][K4] extends Array<ArrayElement<State[K1][K2][K3][K4]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3][K4]>> | number : K5,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4][K5]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4],
        K6 extends keyof State[K1][K2][K3][K4][K5]>(
        k1: K1,
        k2: State[K1] extends Array<ArrayElement<State[K1]>> ? PredicateFunction<ArrayElement<State[K1]>> | number : K2,
        k3: State[K1][K2] extends Array<ArrayElement<State[K1][K2]>> ? PredicateFunction<ArrayElement<State[K1][K2]>> | number : K3,
        k4: State[K1][K2][K3] extends Array<ArrayElement<State[K1][K2][K3]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3]>> | number : K4,
        k5: State[K1][K2][K3][K4] extends Array<ArrayElement<State[K1][K2][K3][K4]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3][K4]>> | number : K5,
        k6: State[K1][K2][K3][K4][K5] extends Array<ArrayElement<State[K1][K2][K3][K4][K5]>> ? PredicateFunction<ArrayElement<State[K1][K2][K3][K4][K5]>> | number : K6,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4][K5][K6]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5][K6]>;
    // Implementation
    subscribe<Part>(
        ...params: (string | number | PredicateFunction<any> | StateSubscriptionFunction<Part> | SubscribeStateOptions)[]
    ): LitElementStateSubscription<Part> {
        const options = optionsFromDefaultOrParams(params, this);
        const subscriptionFunction = params.pop() as StateSubscriptionFunction<Part>;
        const subscription = new LitElementStateSubscription<Part>(
            params as string[],
            subscriptionFunction,
            this.unsubscribe.bind(this),
            options
        );
        this.checkSubscriptionChange(subscription, this._state, true);
        this.stateSubscriptions.push(subscription);
        return subscription;
    }

    private unsubscribe(subscription: LitElementStateSubscription<DeepPartial<State>>) {
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

    private checkSubscriptionChange(subscription: LitElementStateSubscription<any>, statePartial: State | DeepPartial<ReducableState<State>>, initial = false) {
        const changedPartial = this.getChangedPartial(
            subscription.path,
            statePartial
        );
        if (changedPartial === null || changedPartial === undefined) {
            if (subscription.value !== changedPartial || initial) {
                subscription.next(changedPartial, initial);
            }
        } else if (changedPartial === 'path_not_touched' && initial) {
            subscription.next(null, true);
        } else if (changedPartial !== 'path_not_touched') {
            subscription.next(
                this.getChangedPartial(
                    subscription.path,
                    this._state
                ), initial
            );
        }
    }

    private getChangedPartial(
        segments: (string | number)[],
        object: State | DeepPartial<ReducableState<State>>
    ): DeepPartial<State> | 'path_not_touched' {
        let partial = object;
        for (let [index, segment] of segments.entries()) {
            if (typeof segment === 'string' && !isObject(partial)) {
                throw new Error(`Error from lit-state: Subscribed path ${segments.join('.')} doesn't exist!`)
            }
            if ((typeof segment === 'number' || typeof segment === 'function') && !Array.isArray(partial)) {
                throw new Error(`Error from lit-state: Subscribed a path with an array where no array exists!`)
            }
            if (typeof segment === 'function' && Array.isArray(partial)) {
                const elem = (segment as PredicateFunction<State | DeepPartial<State>>)(partial);
                if (elem) segment = partial.indexOf(elem);
                else segment = -1;
            }
            if (segment in partial) {
                partial = partial[segment];
                if (partial === undefined || (partial === null && index < segments.length - 1)) {
                    return undefined;
                }
                if (partial === null) {
                    return null;
                }
            } else {
                return ('_reducerMode' in partial && partial['_reducerMode'] === 'replace') ?
                    undefined : 'path_not_touched';
            }
        }
        return partial as DeepPartial<State>;
    }

    private deepReduce(state: State, change: ReducableState<State> | DeepPartial<ReducableState<State>>) {
        for (const key in change) {
            if (isObject(change[key]) && !(isExceptionFromDeepReduce(change[key])) &&
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
                if (change[key] === undefined || change[key] === null) {
                    state[key] = change[key];
                } else {
                    delete change[key]._reducerMode;
                    Object.assign(
                        state,
                        {[key]: change[key]}
                    );
                }
            }
        }
        return state;
    }
}
