import {DeepPartial} from 'ts-essentials';
import {
    CacheHandler,
    CacheMode,
    ReducableState,
    StateConfig,
    StateSubscriptionFunction,
    SubscribeStateOptions
} from './index';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {isExceptionFromDeepReduce, isObject, optionsFromDefaultOrParams} from './litElementState.helpers';
import {LocalStorageCacheHandler} from './cache.handler';

export class LitElementStateService<State> {
    private static _globalInstance;
    private stateSubscriptions: LitElementStateSubscription<any>[] = [];

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
            ...config?.cache && {
                cache: {
                    prefix: config.cache.prefix,
                    load: config.cache.load ? config.cache.load : []
                }
            }
        }

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

    set(statePartial: DeepPartial<ReducableState<State>>, cache?: CacheMode): void {
        this.deepReduce(
            this._state,
            statePartial,
            cache ? {
                    path: this.config.cache.prefix ? [ this.config.cache.prefix ] : [],
                    mode: cache
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

    private deepReduce(target: State, source: ReducableState<State> | DeepPartial<ReducableState<State>>, cache?: { path: string[], mode: CacheMode }) {
        let cacheHandler: CacheHandler;
        if (cache) {
            if (cache.mode === 'localStorage') {
                cacheHandler = new LocalStorageCacheHandler();
            }
        }
        for (const key in source) {
            if (cache) {
                cache.path.push(key);
            }
            if (isObject(source[key]) && !(isExceptionFromDeepReduce(source[key])) &&
                (!('_reducerMode' in source[key]) || source[key]._reducerMode === 'merge')) {
                delete source[key]._reducerMode;
                if (!target[key]) {
                    Object.assign(
                        target,
                        {[key]: {}}
                    );
                }
                this.deepReduce(
                    target[key],
                    source[key],
                    cache
                );
            } else {
                if (source[key] === undefined || source[key] === null) {
                    target[key] = source[key];
                    if (cache) {
                        cacheHandler.unset(cache.path);
                    }
                } else {
                    delete source[key]._reducerMode;
                    if (cache) {
                        cacheHandler.set(cache.path, source[key]);
                    }
                    Object.assign(
                        target,
                        {[key]: source[key]}
                    );
                }
            }
        }
        return target;
    }

}
