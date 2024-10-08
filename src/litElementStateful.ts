import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions,
    ArraySubscriptionPredicate,
    SubscribeStateOptions,
    SetStateOptions, PredicateFunction, StatePathSegment, IndexOrPredicateFunction
} from './index';
import {LitElementStateService} from './litElementState.service';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {subscribeOptionsFromDefaultOrParams} from './litElementState.helpers';

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
    // TODO: Replace with EntryPath for v5
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1])>(
        path: [ State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends State[K1]>(
        path: [ K1 ],
        subscriptionFunction: StateSubscriptionFunction<T1>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2])>(
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends T1[K2]>(
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T2>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T2>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3])>(
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3
        ],
        subscriptionFunction: StateSubscriptionFunction<T3>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T3>;
    subscribeState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends T2[K3]>(
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            K3
        ],
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
        path:  [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4
        ],
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
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            K4
        ],
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
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5
        ],
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
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
            K5
        ],
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
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5,
            T5[K6] extends Array<any> ? ArraySubscriptionPredicate<K6, T6> : K6
        ],
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
        path: [
            State[K1] extends Array<any> ? ArraySubscriptionPredicate<K1, T1> : K1,
            T1[K2] extends Array<any> ? ArraySubscriptionPredicate<K2, T2> : K2,
            T2[K3] extends Array<any> ? ArraySubscriptionPredicate<K3, T3> : K3,
            T3[K4] extends Array<any> ? ArraySubscriptionPredicate<K4, T4> : K4,
            T4[K5] extends Array<any> ? ArraySubscriptionPredicate<K5, T5> : K5,
            K6
        ],
        subscriptionFunction: StateSubscriptionFunction<T6>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T6>;
    // Implementation
    subscribeState<Part>(
        path: (string | ArraySubscriptionPredicate<string, any>)[],
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> | void {
        const subscription = this.stateService.subscribe.apply(this.stateService, [...path, subscriptionFunction, options]);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [...path, subscriptionFunction, options]);
        }
        return subscription;
    }

    // Overloads
    connectState<K1 extends keyof State>(
        path: [
            K1
        ],
        subscriptionFunction: StateSubscriptionFunction<State[K1]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1>(
        path: [
            K1,
            State[K1] extends Array<any> ? IndexOrPredicateFunction<T1> : K2
        ],
        subscriptionFunction: StateSubscriptionFunction<T1[K2]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<T1[K2]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2>(
        path: [
            K1,
            State[K1] extends Array<any> ? IndexOrPredicateFunction<T1> : K2,
            State[K1] extends Array<any> ? K2 :
                T1[K2] extends Array<any> ? IndexOrPredicateFunction<T2> : K3
        ],
        subscriptionFunction: StateSubscriptionFunction<State[K1] extends Array<any> ? T1[K2] : T2[K3]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<State[K1] extends Array<any> ? T1[K2] : T2[K3]>;
    connectState<K1 extends keyof State,
        T1 extends (State[K1] extends Array<any> ? State[K1][number] : State[K1]),
        K2 extends keyof T1,
        T2 extends (T1[K2] extends Array<any> ? T1[K2][number] : T1[K2]),
        K3 extends keyof T2,
        T3 extends (T2[K3] extends Array<any> ? T2[K3][number] : T2[K3]),
        K4 extends keyof T3>(
        path: [
            K1,
            State[K1] extends Array<any> ? IndexOrPredicateFunction<T1> : K2,
            State[K1] extends Array<any> ? K2 :
                T1[K2] extends Array<any> ? IndexOrPredicateFunction<T2> : K3,
            State[K1] extends Array<any> ?
                (T1[K2] extends Array<any> ? IndexOrPredicateFunction<T2> : K3) :
                T1[K2] extends Array<any> ? K3 :
                    T2[K3] extends Array<any> ? IndexOrPredicateFunction<T3> : K4,
        ],
        subscriptionFunction: StateSubscriptionFunction<
            State[K1] extends Array<any> ?
                (T1[K2] extends Array<any> ? IndexOrPredicateFunction<T2> : T2[K3]) :
                T1[K2] extends Array<any> ? T2[K3] : T3[K4]>,
        options?: SubscribeStateOptions
    ): LitElementStateSubscription<
        State[K1] extends Array<any> ?
            (T1[K2] extends Array<any> ? IndexOrPredicateFunction<T2> : T2[K3]) :
            T1[K2] extends Array<any> ? T2[K3] : T3[K4]>;
    /*
connectState<K1 extends keyof State,
    T1 extends (State[K1] extends (infer E)[] ? E : State[K1]),
    K2 extends keyof T1,
    T2 extends (T1[K2] extends (infer E)[] ? E : T1[K2])>(
    path: [
        K1,
        ...(T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
        K2
    ],
    subscriptionFunction: StateSubscriptionFunction<T2>,
    options?: SubscribeStateOptions
): LitElementStateSubscription<T2>;

connectState<K1 extends keyof State,
T1 extends (State[K1] extends [] ? State[K1][number] : State[K1]),
K2 extends keyof T1,
T2 extends (T1[K2] extends [] ? T1[K2][number] : T1[K2]),
K3 extends keyof T2,
T3 extends (T2[K3] extends [] ? T2[K3][number] : T2[K3])>(
path: [
    K1,
    ...(T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
    K2,
    ...(T2[K3] extends [] ? [IndexOrPredicateFunction<T3>] : []),
],
subscriptionFunction: StateSubscriptionFunction<T2[K3]>,
options?: SubscribeStateOptions
): LitElementStateSubscription<T3>;







connectState<K1 extends keyof State,
T1 extends (State[K1] extends [] ? State[K1][number] : State[K1]),
K2 extends keyof T1,
T2 extends (T1[K2] extends [] ? T1[K2][number] : T1[K2]),
A2 extends (T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
K3 extends keyof T2,
T3 extends (T2[K3] extends [] ? T2[K3][number] : T2[K3]),
A3 extends (T2[K3] extends [] ? [IndexOrPredicateFunction<T3>] : []),
K4 extends keyof T3,
T4 extends (T3[K4] extends [] ? T3[K4][number] : T3[K4]),
A4 extends (T3[K4] extends [] ? [IndexOrPredicateFunction<T4>] : [])>(
path:  [
    K1,
    ...A2, K2,
    ...A3, K3,
    ...A4
],
subscriptionFunction: StateSubscriptionFunction<T4>,
options?: SubscribeStateOptions
): LitElementStateSubscription<T4>;
connectState<K1 extends keyof State,
T1 extends (State[K1] extends [] ? State[K1][number] : State[K1]),
K2 extends keyof T1,
T2 extends (T1[K2] extends [] ? T1[K2][number] : T1[K2]),
A2 extends (T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
K3 extends keyof T2,
T3 extends (T2[K3] extends [] ? T2[K3][number] : T2[K3]),
A3 extends (T2[K3] extends [] ? [IndexOrPredicateFunction<T3>] : []),
K4 extends keyof T3,
T4 extends (T3[K4] extends [] ? T3[K4][number] : T3[K4]),
A4 extends (T3[K4] extends [] ? [IndexOrPredicateFunction<T4>] : [])>(
path:  [
    K1,
    ...A2, K2,
    ...A3, K3,
    ...A4, K4
],
subscriptionFunction: StateSubscriptionFunction<T4>,
options?: SubscribeStateOptions
): LitElementStateSubscription<T4>;
connectState<K1 extends keyof State,
T1 extends (State[K1] extends [] ? State[K1][number] : State[K1]),
K2 extends keyof T1,
T2 extends (T1[K2] extends [] ? T1[K2][number] : T1[K2]),
A2 extends (T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
K3 extends keyof T2,
T3 extends (T2[K3] extends [] ? T2[K3][number] : T2[K3]),
A3 extends (T2[K3] extends [] ? [IndexOrPredicateFunction<T3>] : []),
K4 extends keyof T3,
T4 extends (T3[K4] extends [] ? T3[K4][number] : T3[K4]),
A4 extends (T3[K4] extends [] ? [IndexOrPredicateFunction<T4>] : []),
K5 extends keyof T4,
T5 extends (T4[K5] extends [] ? T4[K5][number] : T4[K5]),
A5 extends (T4[K5] extends [] ? [IndexOrPredicateFunction<T5>] : [])>(
path: [
    K1,
    K2, ...A2,
    K3, ...A3,
    K4, ...A4,
    K5, ...A5
],
subscriptionFunction: StateSubscriptionFunction<T5>,
options?: SubscribeStateOptions
): LitElementStateSubscription<T5>;
connectState<K1 extends keyof State,
T1 extends (State[K1] extends [] ? State[K1][number] : State[K1]),
K2 extends keyof T1,
T2 extends (T1[K2] extends [] ? T1[K2][number] : T1[K2]),
A2 extends (T1[K2] extends [] ? [IndexOrPredicateFunction<T2>] : []),
K3 extends keyof T2,
T3 extends (T2[K3] extends [] ? T2[K3][number] : T2[K3]),
A3 extends (T2[K3] extends [] ? [IndexOrPredicateFunction<T3>] : []),
K4 extends keyof T3,
T4 extends (T3[K4] extends [] ? T3[K4][number] : T3[K4]),
A4 extends (T3[K4] extends [] ? [IndexOrPredicateFunction<T4>] : []),
K5 extends keyof T4,
T5 extends (T4[K5] extends [] ? T4[K5][number] : T4[K5]),
A5 extends (T4[K5] extends [] ? [IndexOrPredicateFunction<T5>] : []),
K6 extends keyof T5,
T6 extends (T5[K6] extends [] ? T5[K6][number] : T5[K6]),
A6 extends (T5[K6] extends [] ? [IndexOrPredicateFunction<T6>] : [])>(
path: [
    K1,
    ...A2, K2,T1
    ...A3, K3,
    ...A4, K4,
    ...A5, K5,
    ...A6, K6
],
subscriptionFunction: StateSubscriptionFunction<T6>,
options?: SubscribeStateOptions
): LitElementStateSubscription<T6>; */
    // Implementation
    connectState<Part>(
        path: (string | ArraySubscriptionPredicate<string, any>)[],
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> {
        const _options = subscribeOptionsFromDefaultOrParams([...path, subscriptionFunction, options], this.stateService);
        const propertyName = [...path, subscriptionFunction, options].pop() as string;
        const _subscriptionFunction = data => {
            if (propertyName in this) {
                const requestUpdate = this[propertyName] === data.current;
                this[propertyName] = data.current;
                if (requestUpdate) { this.requestUpdate(); }
            } else {
                throw new Error(`Property ${propertyName} not found on LitElement!`);
            }
        }
        ([...path, subscriptionFunction, options] as any).push(_subscriptionFunction);
        [...path, subscriptionFunction, options].push(options);
        const subscription = this.stateService.subscribe.apply(this.stateService, [...path, subscriptionFunction, options]);
        if (options.autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [...path, subscriptionFunction, options]);
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
