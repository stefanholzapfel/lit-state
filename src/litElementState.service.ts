import {DeepPartial} from 'ts-essentials';
import {
    CacheHandler,
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
    private cacheHandlers: Map<string, CacheHandler> = new Map();
    constructor(
        initialState?: State,
        config?: StateConfig
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

    config: StateConfig;

    set(statePartial: DeepPartial<ReducableState<State>>, cacheHandlerName?: string): void {
        let cacheHandler;
        if (cacheHandlerName) {
            cacheHandler = this.cacheHandlers.get(cacheHandlerName);
            if (!cacheHandler) {
                console.error(`lit-state: A cache handler with name ${ cacheHandlerName } was not registered! This set call will not be persisted!`)
            }
        }
        this.deepReduce(
            this._state,
            statePartial,
            cacheHandler ? {
                    path: [],
                    handler: cacheHandler
                } : null
        );
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription, statePartial);
        }
    };

    // Overloads
    subscribe<K1 extends keyof State>(
        k1: K1 | ((array: State[K1]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1 | ((array: State[K1]) => boolean),
        k2: K2 | ((array: State[K1][K2]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1 | ((array: State[K1]) => boolean),
        k2: K2 | ((array: State[K1][K2]) => boolean),
        k3: K3 | ((array: State[K1][K2][K3]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1 | ((array: State[K1]) => boolean),
        k2: K2 | ((array: State[K1][K2]) => boolean),
        k3: K3 | ((array: State[K1][K2][K3]) => boolean),
        k4: K4 | ((array: State[K1][K2][K3][K4]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4]>(
        k1: K1 | ((array: State[K1]) => boolean),
        k2: K2 | ((array: State[K1][K2]) => boolean),
        k3: K3 | ((array: State[K1][K2][K3]) => boolean),
        k4: K4 | ((array: State[K1][K2][K3][K4]) => boolean),
        k5: K5 | ((array: State[K1][K2][K3][K4][K5]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4][K5]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4],
        K6 extends keyof State[K1][K2][K3][K4][K5]>(
        k1: K1 | ((array: State[K1]) => boolean),
        k2: K2 | ((array: State[K1][K2]) => boolean),
        k3: K3 | ((array: State[K1][K2][K3]) => boolean),
        k4: K4 | ((array: State[K1][K2][K3][K4]) => boolean),
        k5: K5 | ((array: State[K1][K2][K3][K4][K5]) => boolean),
        k6: K6 | ((array: State[K1][K2][K3][K4][K5][K6]) => boolean),
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4][K5][K6]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5][K6]>;
    // Implementation
    subscribe<Part>(
        ...params: (string | StateSubscriptionFunction<Part> | SubscribeStateOptions)[]
    ): LitElementStateSubscription<Part> {
        const options = optionsFromDefaultOrParams(params, this);
        const subscriptionFunction = params.pop() as StateSubscriptionFunction<Part>;
        const subscription = new LitElementStateSubscription<Part>(
            params as string[],
            subscriptionFunction,
            this.unsubscribe.bind(this),
            options
        );
        if (options.getInitialValue) {
            this.checkSubscriptionChange(subscription, this._state, true);
        }
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
        segments: string[],
        object: State | DeepPartial<ReducableState<State>>
    ): DeepPartial<State> | 'path_not_touched' {
        let partial = object;
        for (const [index, segment] of segments.entries()) {
            if (!isObject(partial)) {
                throw new Error(`Error from lit-state: Subscribed path ${segments.join('.')} doesn't exist!`)
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

    private deepReduce(state: State, change: ReducableState<State> | DeepPartial<ReducableState<State>>, cache?: { path: string[], handler: CacheHandler }) {
        for (const key in change) {
            cache?.path.push(key);
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
                    change[key],
                    cache
                );
            } else {
                if (change[key] === undefined || change[key] === null) {
                    state[key] = change[key];
                    cache?.handler.unset(cache.path, this);
                } else {
                    delete change[key]._reducerMode;
                    cache?.handler.set(cache.path, change[key], this);
                    Object.assign(
                        state,
                        {[key]: change[key]}
                    );
                }
                cache?.path.pop();
            }
        }
        cache?.path.pop();
        return state;
    }

}
