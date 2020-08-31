import {StateSubscriptionFunction, SubscribeStateFromElementOptions, SubscribeStateOptions} from './index';
import {deepCopy} from './litElementState.helpers';

export class LitElementStateSubscription<StatePartial> {
    previousValue: StatePartial = null;
    value: StatePartial = null;
    path: string[];
    
    private subscriptionFunction;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<StatePartial>) => void;
    subscriptionOptions: SubscribeStateOptions | SubscribeStateFromElementOptions;
    
    constructor(
        path: string[],
        subscriptionFunction: StateSubscriptionFunction<StatePartial>,
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
    
    next(value: StatePartial, initial = false) {
        if (this.value !== value || this.subscriptionOptions.pushNestedChanges || initial) {
            this.previousValue = deepCopy(this.value);
            this.value = value;
            this.emitValue();
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
    }
}
