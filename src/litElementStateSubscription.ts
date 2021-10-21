import {
    ArraySubscriptionPredicate,
    StateSubscriptionFunction,
    SubscribeStateFromElementOptions,
    SubscribeStateOptions
} from './index';
import {deepCopy} from './litElementState.helpers';

export class LitElementStateSubscription<SubscribedType> {
    previousValue: SubscribedType = null;
    value: SubscribedType = null;
    valueDeepCopy: SubscribedType = null;
    path: (string | ArraySubscriptionPredicate<string, any>)[];
    closed = false;
    
    private subscriptionFunction;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<SubscribedType>) => void;
    subscriptionOptions: SubscribeStateOptions | SubscribeStateFromElementOptions;
    
    constructor(
        path: (string | ArraySubscriptionPredicate<string, any>)[],
        subscriptionFunction: StateSubscriptionFunction<SubscribedType>,
        unsubscriptionFunction: (
            subscription: LitElementStateSubscription<any>
        ) => void,
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
