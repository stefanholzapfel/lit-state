import { LitElement } from 'lit-element';
import { DeepPartial } from 'ts-essentials';
import {
    CustomStateReducer,
    LitElementStateSubscriptionFunction,
    ReducableState,
    //State,
    SubscribeStateOptions
} from './litElementState';
import { LitElementStateSubscription } from './litElementStateSubscription';

export class LitElementStateService<State> {
    static async init(
        initialState: State,
        subscribeOptions?: SubscribeStateOptions
    ): Promise<LitElementStateService> {
        if (subscribeOptions) {
            LitElementStateService.subscribeOptions = {
                ...LitElementStateService.subscribeOptions,
                ...subscribeOptions
            };
        }
        this._state = initialState;
        return LitElementStateService;
    }
    
    private static _state: State;
    static get state(): State {
        return this._state;
    };
    
    private static subscribeOptions: SubscribeStateOptions = {
        getInitialValue: true,
        autoUnsubscribe: true
    };
    
    private static stateSubscriptions: LitElementStateSubscription<any>[] = [];
    
    static set(statePartial: DeepPartial<ReducableState>, customReducer?: CustomStateReducer): void {
        if (customReducer) {
            this._state = customReducer(
                this._state,
                statePartial
            );
        } else {
            this.deepMerge(
                this._state,
                statePartial
            );
        }
        for (const subscription of this.stateSubscriptions) {
            this.checkSubscriptionChange(subscription, statePartial);
        }
    };
    
    // Overloads
    static subscribe<K1 extends keyof State>(
        k1: K1,
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    static subscribe<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    static subscribe<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        subscriptionFunction: LitElementStateSubscriptionFunction<State[K1][K2][K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    static subscribe<K1 extends keyof State,
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
    static subscribe<Part>(
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
    static connect<K1 extends keyof State>(
        k1: K1,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    static connect<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    static connect<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        propertyName: string,
        litElement: LitElement,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    static connect<K1 extends keyof State,
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
    static connect<Part>(
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
    
    static getSubscribeOptions(): Readonly<SubscribeStateOptions> {
        return LitElementStateService.subscribeOptions;
    }
    
    // Private helper functions
    
    private static subscribeHelper<Part>(
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
    
    private static checkSubscriptionChange(subscription: LitElementStateSubscription<any>, statePartial: DeepPartial<ReducableState>) {
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
    
    
    private static unsubscribe(subscription: LitElementStateSubscription<DeepPartial<State>>) {
        const subIndex = this.stateSubscriptions.indexOf(subscription);
        if (subIndex >= 0) {
            this.stateSubscriptions.splice(
                subIndex,
                1
            );
        }
    }
    
    private static getChangedPartial(
        segments: string[],
        object: DeepPartial<State>
    ): DeepPartial<State> | 'path_not_found' {
        let partial = object;
        for (const segment of segments) {
            if (segment in partial) {
                partial = partial[segment];
            } else {
                return 'path_not_found';
            }
        }
        return partial;
    }
    
    private static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Map) && !(item instanceof Set));
    }
    
    private static deepMerge(target: object, source: object) {
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
                this.deepMerge(
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
