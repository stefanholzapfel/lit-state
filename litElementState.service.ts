import { LitElement } from 'lit-element';
import { DeepPartial } from 'ts-essentials';
import {
    CustomStateReducer,
    LitElementStateSubscriptionFunction,
    ReducableState,
    SubscribeStateOptions
} from './index';
import { LitElementStateSubscription } from './litElementStateSubscription';

export class LitElementStateService<State> {
    constructor(
        initialState: State,
        subscribeOptions?: SubscribeStateOptions,
        global = false
    ) {
        if (subscribeOptions) {
            this.subscribeOptions = {
                ...this.subscribeOptions,
                ...subscribeOptions
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
    
    private subscribeOptions: SubscribeStateOptions = {
        getInitialValue: true,
        autoUnsubscribe: true
    };
    
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
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1][K2][K3]>,
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
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1][K2][K3][K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    // Implementation
    subscribe<Part>(
        ...params: (string | LitElementStateSubscriptionFunction<Part> | SubscribeStateOptions)[]
    ): LitElementStateSubscription<Part> {
        let options = this.subscribeOptions;
        if (params[params.length - 1].hasOwnProperty('getInitialValue')) {
            options = params.pop() as SubscribeStateOptions;
        }
        const subscriptionFunction = params.pop() as LitElementStateSubscriptionFunction<Part>;
        return this.subscribeHelper(
            params as string[],
            subscriptionFunction,
            options
        );
    }
    
    // Overloads
    connect<K1 extends keyof State>(
        k1: K1,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    connect<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    connect<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    connect<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    // Implementation
    connect<Part>(
        ...params: (string | LitElement | SubscribeStateOptions)[]
    ): LitElementStateSubscription<Part> {
        let options = this.subscribeOptions;
        if (params[params.length - 1].hasOwnProperty('getInitialValue')) {
            options = params.pop() as SubscribeStateOptions;
        }
        const litElement = params.pop() as LitElement;
        const propertyName = params.pop() as string;
        const subscriptionFunction = data => {
            if (litElement && propertyName in litElement) {
                litElement[propertyName] = data.current;
            } else {
                throw new Error('LitElement or property on LitElement not found! Maybe the element was removed' +
                    ' but connectedProperty not unsubscribed?');
            }
        };
        return this.subscribeHelper(
            params as string[],
            subscriptionFunction,
            options
        );
    }
    
    getSubscribeOptions(): Readonly<SubscribeStateOptions> {
        return this.subscribeOptions;
    }
    
    // Private helper functions
    
    private subscribeHelper<Part>(
        path: string[],
        subscriptionFunction: LitElementStateSubscriptionFunction<Part>,
        options: SubscribeStateOptions
    ): LitElementStateSubscription<Part> {
        const subscription = new LitElementStateSubscription<Part>(
            path,
            subscriptionFunction,
            this.unsubscribe.bind(this)
        );
        if (options.getInitialValue) {
            this.checkSubscriptionChange(subscription, this._state);
        }
        this.stateSubscriptions.push(subscription);
        return subscription;
    }
    
    private checkSubscriptionChange(subscription: LitElementStateSubscription<any>, statePartial: State | DeepPartial<ReducableState<State>>) {
        const changedPartial = this.getChangedPartial(
            subscription.path,
            statePartial
        );
        // TODO: Works properly if path was set to null from higher level?
        if (changedPartial !== 'path_not_found') {
            const nextvalue = (changedPartial !== null && changedPartial !== undefined) ?
                this.getChangedPartial(
                    subscription.path,
                    this._state
                ) :
                null;
            subscription.next(nextvalue);
        }
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
    
    private getChangedPartial(
        segments: string[],
        object: State | DeepPartial<ReducableState<State>>
    ): DeepPartial<State> | 'path_not_found' {
        let partial = object;
        for (const segment of segments) {
            if (segment in partial) {
                partial = partial[segment];
            } else {
                return 'path_not_found';
            }
        }
        return partial as DeepPartial<State>;
    }
    
    private isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Map) && !(item instanceof Set));
    }

    private deepReduce(target: State, source: ReducableState<State> | DeepPartial<ReducableState<State>>) {
        for (const key in source) {
            if (this.isObject(source[key]) &&
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
    
    public static deepCopy(obj) {
        let copy;
        
        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' !== typeof obj) {
            return obj;
        }
        
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (let i = 0,
                     len = obj.length; i < len; i++) {
                copy[i] = this.deepCopy(obj[i]);
            }
            return copy;
        }
        
        // Handle Map
        if (obj instanceof Map) {
            const copy = new Map();
            obj.forEach((value, key, map) => {
                copy.set(key, this.deepCopy(value));
            });
            return copy;
        }
        
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (const attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = this.deepCopy(obj[attr]);
                }
            }
            return copy;
        }
        
        throw new Error('Unable to copy obj! Its type isn\'t supported.');
    }
    
}

