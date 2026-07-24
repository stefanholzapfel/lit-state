import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions,
    CheckedStatePath, StatePath, StatePathValue,
    SetStateOptions
} from './index.js';
import {LitElementStateService} from './litElementState.service.js';
import {LitElementStateSubscription} from './litElementStateSubscription.js';
import {subscribeOptionsFromDefaultOrParams} from "./litElementState.helpers.js";

export class LitElementStateful<State> extends LitElement {
    private autoUnsubscribeCache: Map<LitElementStateSubscription<any>, any[]> = new Map();
    private stateService: LitElementStateService<State>;

    constructor(stateService?: LitElementStateService<State>) {
        super();
        if (stateService) {
            this.stateService = stateService;
        } else if (LitElementStateService.getGlobalInstance()) {
            this.stateService = LitElementStateService.getGlobalInstance();
        } else {
            throw new Error('Need a LitElementState service given via constructor or a global state available.');
        }
    }

    get state(): State {
        return this.stateService.state;
    };

    subscribeState<const P extends StatePath<State>>(
        path: CheckedStatePath<State, P>,
        subscriptionFunction: StateSubscriptionFunction<StatePathValue<State, P>>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<StatePathValue<State, P>>;
    subscribeState<Part>(
        path: any, // loose on purpose: the public overload types the path
        subscriptionFunction: StateSubscriptionFunction<Part>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> {
        const subscription = this.stateService.subscribe(path as any, subscriptionFunction as any, options);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [path, subscriptionFunction, options]);
        }
        return subscription as LitElementStateSubscription<Part>;
    }

    connectState<const P extends StatePath<State>>(
        path: CheckedStatePath<State, P>,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<StatePathValue<State, P>>;
    connectState<Part>(
        path: any, // loose on purpose: the public overload types the path
        propertyName: any,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<Part> {
        options = subscribeOptionsFromDefaultOrParams(options, this.stateService);
        const subscriptionFunction: StateSubscriptionFunction<any> = data => {
            if (propertyName in this) {
                const requestUpdate = (this as any)[propertyName] === data.current;
                (this as any)[propertyName] = data.current;
                if (requestUpdate) {
                    this.requestUpdate();
                }
            } else {
                throw new Error(`Property ${propertyName} not found on LitElement!`);
            }
        }
        const subscription = this.stateService.subscribe(path as any, subscriptionFunction, options);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [path, subscriptionFunction, options]);
        }
        return subscription as LitElementStateSubscription<Part>;
    }

    /** Builds a reusable, position-exact validated path constant (see
     *  LitElementStateService.checkPath). */
    checkPath<const P extends StatePath<State>>(path: CheckedStatePath<State, P>): P {
        return path as P;
    }

    // Overload: with a typed entry path (see LitElementStateService.set).
    setState<const P extends StatePath<State>>(
        statePartial: StatePathValue<State, P> | StateChange<StatePathValue<State, P>>,
        options: SetStateOptions & { entryPath: CheckedStatePath<State, P> }
    ): void;
    // Overload: explicit target type + entry path for dynamic paths (see
    // LitElementStateService.set).
    setState<Target = never>(
        statePartial: StateChange<NoInfer<Target>>,
        options: SetStateOptions & { entryPath: StatePath<State> }
    ): void;
    // Overload: whole-state change. SetStateOptions has no entryPath, so fresh
    // literals with one fail this overload (excess property) and are typed by
    // the overloads above.
    //
    // The implementation signature below widens entryPath to `any`, see
    // LitElementStateService.set.
    setState<TargetedState = State>(
        statePartial: StateChange<NoInfer<TargetedState>>,
        options?: SetStateOptions
    ): void;
    setState(
        statePartial: any,
        options?: SetStateOptions & { entryPath?: any }) {
        this.stateService.set(statePartial, options);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.autoUnsubscribeCache.forEach((params, subscription) => {
            if (subscription.closed) {
                const newSubscription = this.stateService.subscribe.apply(this.stateService, [params[0], params[1], params[2]]);
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
