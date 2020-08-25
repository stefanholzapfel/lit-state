import { DeepPartial } from 'ts-essentials';
import {
    CustomStateReducer,
    StateSubscriptionFunction,
    ReducableState,
    SubscribeStateOptions, SubscribeStateFromElementOptions
} from './index';
import { LitElementStateSubscription } from './litElementStateSubscription';
import {isObject, optionsFromDefaultOrParams} from './litElementState.helpers';

export class LitElementStateService<State> {
    constructor(
        initialState: State,
        defaultSubscribeOptions?: SubscribeStateFromElementOptions,
        global = false
    ) {
        if (defaultSubscribeOptions) {
            this._defaultSubscribeStateFromElementOptions = {
                ...this._defaultSubscribeStateFromElementOptions,
                ...defaultSubscribeOptions
            };
        }
        this._state = initialState;
        if (global) {
            LitElementStateService._globalInstance = this;
        }
    }

    private static _globalInstance;
    static getGlobalInstance(): LitElementStateService<any> {
        return LitElementStateService._globalInstance;
    }

    private _state: State;
    get state(): State {
        return this._state;
    };

    private _defaultSubscribeStateFromElementOptions = {
        getInitialValue: true,
        pushNestedChanges: false,
        getDeepCopy: false,
        autoUnsubscribe: true
    }
    get defaultSubscribeFromElementOptions(): Readonly<SubscribeStateFromElementOptions> {
        return this._defaultSubscribeStateFromElementOptions;
    }

    private stateSubscriptions: LitElementStateSubscription<any>[] = [];

    set(statePartial: DeepPartial<ReducableState<State>>, customReducer?: CustomStateReducer<State>): void {
        if (customReducer) {
            this._state = customReducer(
                this._state,
                statePartial
            );
        } else {
            this.deepReduce(
                this._state,
                statePartial
            );
        }
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
        k2: K2,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
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
            this.checkSubscriptionChange(subscription, this._state);
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

    private checkSubscriptionChange(subscription: LitElementStateSubscription<any>, statePartial: State | DeepPartial<ReducableState<State>>) {
        const changedPartial = this.getChangedPartial(
            subscription.path,
            statePartial
        );
        if (subscription.value && changedPartial === 'path_maybe_deleted') {
            subscription.next(undefined);
        } else if (changedPartial !== null && changedPartial !== undefined && changedPartial !== 'path_not_touched') {
            subscription.next(
                this.getChangedPartial(
                    subscription.path,
                    this._state
                )
            );
        }
    }

    private getChangedPartial(
        segments: string[],
        object: State | DeepPartial<ReducableState<State>>
    ): DeepPartial<State> | 'path_not_touched' | 'path_deleted' {
        let partial = object;
        for (const segment of segments) {
            if (!isObject(partial)) {
                throw new Error(`Error from subscription: Path ${ segments.join('.') } doesn't exist!`)
            }
            if (segment in partial) {
                partial = partial[segment];
                if (partial === null || partial === undefined) {
                    return 'path_deleted';
                }
            } else {
                return ('_reducerMode' in partial && partial['_reducerMode'] === 'replace') ?
                    'path_deleted' : 'path_not_touched';
            }
        }
        return partial as DeepPartial<State>;
    }

    private deepReduce(target: State, source: ReducableState<State> | DeepPartial<ReducableState<State>>) {
        for (const key in source) {
            if (isObject(source[key]) &&
                (!('_reducerMode' in source[key]) || source[key]._reducerMode === 'merge')) {
                delete source[key]._reducerMode;
                if (!target[key]) {
                    Object.assign(
                        target,
                        { [key]: {} }
                    );
                }
                this.deepReduce(
                    target[key],
                    source[key]
                );
            } else {
                if (source[key] === undefined) {
                    source[key] = undefined;
                }
                else if (source[key] === null) {
                    source[key] = null;
                } else {
                    delete source[key]._reducerMode;
                    Object.assign(
                        target,
                        { [key]: source[key] }
                    );
                }
            }
        }
        return target;
    }

}

