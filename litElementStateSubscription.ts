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
    
    next(value: StatePartial) {
        if (this.value !== value || this.subscriptionOptions.pushNestedChanges) {
            this.previousValue = (this.value === value || this.subscriptionOptions.getDeepCopy) ?
                this.value : deepCopy(this.value);
            this.value = this.subscriptionOptions.getDeepCopy ?
                deepCopy(value) : value;
            this.emitValue();
        }
    }
    
    emitValue() {
        this.subscriptionFunction(
            {
                previous: this.previousValue,
                current: this.value
            }
        );
    }
    
    unsubscribe() {
        this.unsubscribeFunction(this);
    }
}
