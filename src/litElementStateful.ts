import {DeepPartial} from 'ts-essentials';
import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions, ArraySubscriptionPredicate, SubscribeStateOptions
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

    setState(statePartial: DeepPartial<StateChange<State>>, cacheHandlerName?: string) {
        this.stateService.set(statePartial, cacheHandlerName);
    }

    // Overloads
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends State[K1]>(
        k1: K1,
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends T1[K2]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
        k2: K2,
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<K1 extends keyof State,
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
    subscribeState<Part>(
        ...params: (string | ArraySubscriptionPredicate<string, any> | StateSubscriptionFunction<Part> | SubscribeStateFromElementOptions)[]
    ): LitElementStateSubscription<Part> | void {
        const subscription = this.stateService.subscribe.apply(this.stateService, params);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, params);
        }
        return subscription;
    }

    // Overloads
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    connectState<K1 extends keyof State,
        T1 extends State[K1]>(
        k1: K1,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1[K2]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends T1[K2]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: K2,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1[K2]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends T2[K3]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: K3,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4,T4> : K4,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T4>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends T3[K4]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: K4,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T4>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4,T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5,T5> : K5,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T5>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4]),
        K5 extends keyof T4,
        T5 extends T4[K5]>(
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4,T4> : K4,
        k5: K5,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T5>;
    connectState<K1 extends keyof State,
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
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4,T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5,T5> : K5,
        k6: T5[K6] extends Array<any> ? ArraySubscriptionPredicate<K6,T6> : K6,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T6>;
    connectState<K1 extends keyof State,
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
        k1: State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1,T1> : K1,
        k2: T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2,T2> : K2,
        k3: T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3,T3> : K3,
        k4: T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4,T4> : K4,
        k5: T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5,T5> : K5,
        k6: K6,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T6>;
    // Implementation
    connectState<Part>(
        ...params: (string | ArraySubscriptionPredicate<string, any> | SubscribeStateFromElementOptions)[]
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
            if (subscription.closed) {
                const newSubscription = this.stateService.subscribe.apply(this.stateService, params);
                this.autoUnsubscribeCache.set(newSubscription, params);
                this.autoUnsubscribeCache.delete(subscription);
            }
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.autoUnsubscribeCache.forEach((params, subscription) => subscription.unsubscribe());
    }
}
