import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions,
    ElementSelector,
    SubscribeStateOptions,
    SetStateOptions
} from './index';
import {LitElementStateService} from './litElementState.service';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {subscribeOptionsFromDefaultOrParams} from "./litElementState.helpers";

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

    // Overloads
    subscribeState<K1 extends keyof State,
        T1 extends State[K1]>(
        path: [ State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends State[K1]>(
        path: [ K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T2>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T1[K2]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1[K2]>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3
        ],
        subscriptionFunction: StateSubscriptionFunction<T3>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            K3
        ],
        subscriptionFunction: StateSubscriptionFunction<T2[K3]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T2[K3]>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path:  [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4
        ],
        subscriptionFunction: StateSubscriptionFunction<T4>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T4>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path:  [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            K4
        ],
        subscriptionFunction: StateSubscriptionFunction<T3[K4]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3[K4]>;
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
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5
        ],
        subscriptionFunction: StateSubscriptionFunction<T5>,
        options?: SubscribeStateFromElementOptions
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
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            K5
        ],
        subscriptionFunction: StateSubscriptionFunction<T4[K5]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T4[K5]>;
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
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ElementSelector<K6, T6> : K6
        ],
        subscriptionFunction: StateSubscriptionFunction<T6>,
        options?: SubscribeStateFromElementOptions
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5,
            K6
        ],
        subscriptionFunction: StateSubscriptionFunction<T5[K6]>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T5[K6]>;
    // Implementation
    subscribeState<Part>(
        path: (string | ElementSelector<string, any>)[],
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> {
        const subscription = this.stateService.subscribe(path, subscriptionFunction, options);
        if (options.autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [path, subscriptionFunction, options]);
        }
        return subscription;
    }

    // Overloads
    connectState<K1 extends keyof State,
        T1 extends State[K1]>(
        path: [ State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    connectState<K1 extends keyof State,
        T1 extends State[K1]>(
        path: [ K1 ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T2>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            K2
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T1[K2]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            K3
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T2[K3]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3,
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path:  [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4
        ],
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
        T4 extends (T3[K4] extends Array<any> ? T3[K4][number] : T3[K4])>(
        path:  [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            K4
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T3[K4]>;
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
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5
        ],
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
        T5 extends (T4[K5] extends Array<any> ? T4[K5][number] : T4[K5])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            K5
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T4[K5]>;
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
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5,
            T5[K6] extends Array<any> ? ElementSelector<K6, T6> : K6
        ],
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
        T6 extends (T5[K6] extends Array<any> ? T5[K6][number] : T5[K6])>(
        path: [
            State[K1] extends Array<any> ? ElementSelector<K1, T1> : K1,
            T1[K2] extends Array<any> ? ElementSelector<K2, T2> : K2,
            T2[K3] extends Array<any> ? ElementSelector<K3, T3> : K3,
            T3[K4] extends Array<any> ? ElementSelector<K4, T4> : K4,
            T4[K5] extends Array<any> ? ElementSelector<K5, T5> : K5,
            K6
        ],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<T5[K6]>;
    // Implementation
    connectState<Part>(
        path: (string | ElementSelector<string, any>)[],
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> {
        options = subscribeOptionsFromDefaultOrParams(options, this.stateService);
        const subscriptionFunction = data => {
            if (propertyName in this) {
                const requestUpdate = this[propertyName] === data.current;
                this[propertyName] = data.current;
                if (requestUpdate) {
                    this.requestUpdate();
                }
            } else {
                throw new Error(`Property ${propertyName} not found on LitElement!`);
            }
        }
        const subscription = this.stateService.subscribe<Part>(path, subscriptionFunction, options);
        if (options.autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [path, subscriptionFunction, options]);
        }
        return subscription;
    }
    setState(
        statePartial: StateChange<State>,
        options?: SetStateOptions<State>) {
        this.stateService.set(statePartial, options);
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
