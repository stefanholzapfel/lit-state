import {LitElement} from 'lit-element';
import {DeepPartial} from 'ts-essentials';
import {
    CustomStateReducer,
    StateSubscriptionFunction,
    ReducableState,
    SubscribeStateFromElementOptions
} from './index';
import {LitElementStateService} from './litElementState.service';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {optionsFromDefaultOrParams} from './litElementState.helpers';

export class LitElementStateful<State> extends LitElement {

    private autoUnsubscribeSubs: LitElementStateSubscription<any>[] = [];
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

    setState(statePartial: DeepPartial<ReducableState<State>>, customReducer?: CustomStateReducer<State>) {
        this.stateService.set(statePartial, customReducer);
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
        const subscription = this.stateService.subscribe.apply(this.stateService, params) as LitElementStateSubscription<Part>;
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeSubs.push(subscription);
        }
        return subscription;
    }

    // TODO: AUTOCONNECT FEATURE THAT AUTOMATICALLY CONNECTS ALL PROPERTIES IN GIVEN STATE PATH WITH PROPERTIES ON
    //  ELEMENT (IF PRESENT)?

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
    // Implementation
    connectState<Part>(
        ...params: (string | SubscribeStateFromElementOptions)[]
    ): LitElementStateSubscription<Part> {
        const options = optionsFromDefaultOrParams(params, this.stateService);
        const propertyName = params.pop() as string;
        const subscriptionFunction = data => {
            if (propertyName in this) {
                this[propertyName] = data.current;
            } else {
                throw new Error(`Property ${propertyName} not found on LitElement!`);
            }
        }
        (params as any).push(subscriptionFunction);
        params.push(options);
        const subscription = this.stateService.subscribe.apply(this.stateService, params);
        if (options.autoUnsubscribe) {
            this.autoUnsubscribeSubs.push(subscription);
        }
        return subscription;
    }



    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.autoUnsubscribeSubs.forEach(subscription => subscription.unsubscribe())
    }
}
