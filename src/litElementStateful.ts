import {DeepPartial} from 'ts-essentials';
import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    ReducableState,
    SubscribeStateFromElementOptions
} from './index';
import {LitElementStateService} from './litElementState.service';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {optionsFromDefaultOrParams} from './litElementState.helpers';

export class LitElementStateful<State> extends LitElement {

    private autoUnsubscribeCache: Map<LitElementStateSubscription<any>, any> = new Map();
    private stateService: LitElementStateService<State>;

    constructor(stateService?: LitElementStateService<State>) {
        super();
        if (stateService) {
            this.stateService = stateService;
        } else if (LitElementStateService.getGlobalInstance()) {
            this.stateService = LitElementStateService.getGlobalInstance();
        } else {
            throw new Error('Need a LitElementState service given via constructor or a global state available.')
        }
    }

    get state(): State {
        return this.stateService.state;
    };

    setState(statePartial: DeepPartial<ReducableState<State>>, cacheHandlerName?: string) {
        this.stateService.set(statePartial, cacheHandlerName);
    }

    // Overloads
    subscribeState<K1 extends keyof State>(
        k1: K1,
        subscriptionFunction: StateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1]>;
    subscribeState<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    subscribeState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    subscribeState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        subscriptionFunction: StateSubscriptionFunction<State[K1][K2][K3][K4]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    // Implementation
    subscribeState<Part>(
        ...params: (string | StateSubscriptionFunction<Part> | SubscribeStateFromElementOptions)[]
    ): LitElementStateSubscription<Part> | void {
        const subscription = this.stateService.subscribe.apply(this.stateService, params);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, params);
        }
        return subscription;
    }

    // TODO: AUTOCONNECT FEATURE THAT AUTOMATICALLY CONNECTS ALL PROPERTIES IN GIVEN STATE PATH WITH PROPERTIES ON
    //  ELEMENT (IF PRESENT)?

    // TODO: Allow to subscribe to an element of an array (give a matcher function).

    // Overloads
    connectState<K1 extends keyof State>(
        k1: K1,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1]>;
    connectState<K1 extends keyof State,
        K2 extends keyof State[K1]>(
        k1: K1,
        k2: K2,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2]>;
    connectState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2]>(
        k1: K1,
        k2: K2,
        k3: K3,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3]>;
    connectState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4]>;
    connectState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        k5: K5,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5]>;
    connectState<K1 extends keyof State,
        K2 extends keyof State[K1],
        K3 extends keyof State[K1][K2],
        K4 extends keyof State[K1][K2][K3],
        K5 extends keyof State[K1][K2][K3][K4],
        K6 extends keyof State[K1][K2][K3][K4][K5]>(
        k1: K1,
        k2: K2,
        k3: K3,
        k4: K4,
        k5: K5,
        k6: K6,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<State[K1][K2][K3][K4][K5][K6]>;
    // Implementation
    connectState<Part>(
        ...params: (string | SubscribeStateFromElementOptions)[]
    ): LitElementStateSubscription<Part> {
        const options = optionsFromDefaultOrParams(params, this.stateService);
        const propertyName = params.pop() as string;
        const subscriptionFunction = data => {
            if (propertyName in this) {
                const requestUpdate = this[propertyName] === data.current;
                this[propertyName] = data.current;
                if (requestUpdate) { this.requestUpdate(); }
            } else {
                throw new Error(`Property ${propertyName} not found on LitElement!`);
            }
        }
        (params as any).push(subscriptionFunction);
        params.push(options);
        const subscription = this.stateService.subscribe.apply(this.stateService, params);
        if (options.autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, params);
        }
        return subscription;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.autoUnsubscribeCache.forEach((params, subscription) => {
            const newSubscription = this.stateService.subscribe.apply(this.stateService, params);
            this.autoUnsubscribeCache.set(params, newSubscription);
            this.autoUnsubscribeCache.delete(subscription);
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.autoUnsubscribeCache.forEach((params, subscription) => subscription.unsubscribe());
    }
}
