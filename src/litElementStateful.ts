import { LitElement } from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions,
    CheckedStatePath, StatePathConstraint, StatePathValue,
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

    // Overload
    subscribeState<const P extends StatePathConstraint<State>>(
        path: CheckedStatePath<State, P>,
        subscriptionFunction: StateSubscriptionFunction<StatePathValue<State, P>>,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<StatePathValue<State, P>>;
    // Implementation
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

    // Overload
    connectState<const P extends StatePathConstraint<State>>(
        path: CheckedStatePath<State, P>,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ): LitElementStateSubscription<StatePathValue<State, P>>;
    // Implementation
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

    // Overload: with a typed entry path (see LitElementStateService.set).
    setState<const P extends StatePathConstraint<State>>(
        statePartial: StatePathValue<State, P> | StateChange<StatePathValue<State, P>>,
        options: SetStateOptions<State> & { entryPath: CheckedStatePath<State, P> }
    ): void;
    // Overload: whole-state change. `Omit` makes literals with an entryPath fail
    // this overload (excess property), so they are typed by the overload above;
    // pre-built option objects (non-fresh) still match for backward compatibility.
    setState(
        statePartial: StateChange<State>,
        options?: Omit<SetStateOptions<State>, 'entryPath'>
    ): void;
    setState(
        statePartial: any,
        options?: SetStateOptions<State>) {
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
