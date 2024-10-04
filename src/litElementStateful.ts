import {LitElement} from 'lit';
import {
    StateSubscriptionFunction,
    StateChange,
    SubscribeStateFromElementOptions,
    SetStateOptions, StatePath, StatePathType
} from './index';
import {LitElementStateService} from './litElementState.service';
import {LitElementStateSubscription} from './litElementStateSubscription';
import {subscribeOptionsFromDefaultOrParams} from './litElementState.helpers';

export class LitElementStateful<State> extends LitElement {
    private autoUnsubscribeCache: Map<LitElementStateSubscription<State, any>, any[]> = new Map();
    private stateService: LitElementStateService<State>;

    constructor(stateService?: LitElementStateService<State>) {
        super();
        if (stateService) {
            this.stateService = stateService;
        } else if (LitElementStateService.getGlobalInstance()) {
            this.stateService = LitElementStateService.getGlobalInstance<State>();
        } else {
            throw new Error('Need a LitElementState service given via constructor or a global state available.')
        }
    }

    get state(): State {
        return this.stateService.state;
    };

    subscribeState<Path extends StatePath<State>, SubscribedType = StatePathType<State, Path>>(
        path: Path,
        subscriptionFunction: StateSubscriptionFunction<SubscribedType>,
        options?: SubscribeStateFromElementOptions
    ) {
        const subscription = this.stateService.subscribe(path, subscriptionFunction, options);
        if ((subscription.subscriptionOptions as SubscribeStateFromElementOptions).autoUnsubscribe) {
            this.autoUnsubscribeCache.set(subscription, [path, subscriptionFunction, options]);
        }
        return subscription;
    }

    connectState<Path extends StatePath<State>>(
        path: Path,
        propertyName: string,
        options?: SubscribeStateFromElementOptions
    ) {
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
        const subscription = this.stateService.subscribe<Path>(path, subscriptionFunction, options);
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
                const newSubscription = this.stateService.subscribe(params[0], params[1], params[2]);
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
