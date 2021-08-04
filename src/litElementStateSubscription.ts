import {StateSubscriptionFunction, SubscribeStateFromElementOptions, SubscribeStateOptions} from './index';
import {deepCopy} from './litElementState.helpers';

export class LitElementStateSubscription<SubscribedType> {
    previousValue: SubscribedType = null;
    value: SubscribedType = null;
    path: string[];
    closed = false;
    
    private subscriptionFunction;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<SubscribedType>) => void;
    subscriptionOptions: SubscribeStateOptions | SubscribeStateFromElementOptions;
    
    constructor(
        path: string[],
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
        if (this.value !== value || this.subscriptionOptions.pushNestedChanges || initial) {
            this.previousValue = deepCopy(this.value);
            this.value = value;
            if (!(initial && !this.subscriptionOptions.getInitialValue)) {
                this.emitValue();
            }
        }
    }
    
    emitValue() {
        this.subscriptionFunction(
            {
                previous: this.previousValue,
                current: this.subscriptionOptions.getDeepCopy ?
                    deepCopy(this.value) : this.value
            }
        );
    }
    
    unsubscribe() {
        this.unsubscribeFunction(this);
        this.closed = true;
    }
}
