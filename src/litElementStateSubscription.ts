import {
    StatePath,
    StateSubscriptionFunction,
    SubscribeStateFromElementOptions,
    SubscribeStateOptions
} from './index';
import {deepCopy} from './litElementState.helpers';

export class LitElementStateSubscription<State, SubscribedType> {
    previousValue: SubscribedType = null;
    value: SubscribedType = null;
    valueDeepCopy: SubscribedType = null;
    path: StatePath<State>;
    closed = false;

    private subscriptionFunction;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<State, SubscribedType>) => void;
    subscriptionOptions: SubscribeStateOptions | SubscribeStateFromElementOptions;

    constructor(
        path: StatePath<State>,
        subscriptionFunction: StateSubscriptionFunction<SubscribedType>,
        unsubscriptionFunction: (subscription: LitElementStateSubscription<State, SubscribedType>) => void,
        subscriptionOptions?: SubscribeStateOptions
    ) {
        this.path = path;
        this.subscriptionFunction = subscriptionFunction;
        this.unsubscribeFunction = unsubscriptionFunction;
        this.subscriptionOptions = subscriptionOptions;
    }

    next(value: SubscribedType, initial = false) {
        this.value = value;
        this.previousValue = this.valueDeepCopy;
        this.valueDeepCopy = deepCopy(value);
        if (!initial || this.subscriptionOptions.getInitialValue) {
            this.subscriptionFunction(
                {
                    previous: this.previousValue,
                    current: this.subscriptionOptions.getDeepCopy ?
                        this.valueDeepCopy : this.value
                }
            );
        }
    }

    unsubscribe() {
        this.unsubscribeFunction(this);
        this.closed = true;
    }
}
