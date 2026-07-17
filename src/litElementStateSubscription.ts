import {
    StatePath,
    StateSubscriptionFunction,
    SubscribeStateFromElementOptions,
    SubscribeStateOptions
} from './index.js';
import {deepCopy} from './litElementState.helpers.js';

export class LitElementStateSubscription<SubscribedType> {
    previousValue: SubscribedType | null = null;
    value: SubscribedType | null = null;
    valueDeepCopy: SubscribedType | null = null;
    path: StatePath<any>;
    closed = false;

    private subscriptionFunction: StateSubscriptionFunction<SubscribedType>;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<SubscribedType>) => void;
    subscriptionOptions: SubscribeStateOptions | SubscribeStateFromElementOptions;
    
    constructor(
        path: StatePath<any>,
        subscriptionFunction: StateSubscriptionFunction<SubscribedType>,
        unsubscriptionFunction: (
            subscription: LitElementStateSubscription<any>
        ) => void,
        subscriptionOptions?: SubscribeStateOptions
    ) {
        this.path = path;
        this.subscriptionFunction = subscriptionFunction;
        this.unsubscribeFunction = unsubscriptionFunction;
        this.subscriptionOptions = subscriptionOptions!;
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
                        // We need to deepcopy again because we need to avoid that the user can edit the subscription's deep copy (it's needed for nested change comparisons)
                        deepCopy(value)
                            : this.value
                }
            );
        }
    }

    unsubscribe() {
        this.unsubscribeFunction(this);
        this.closed = true;
    }
}
