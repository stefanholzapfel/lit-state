import { LitElementStateSubscriptionFunction } from './litElementState';
import { LitElementStateService } from './litElementState.service';

export class LitElementStateSubscription<P> {
    previousValue: P = null;
    value: P = null;
    path: string[];
    
    private subscriptionFunction;
    private unsubscribeFunction: (subscription: LitElementStateSubscription<P>) => void;
    
    constructor(
        path: string[],
        subscriptionFunction: LitElementStateSubscriptionFunction<P>,
        unsubscriptionFunction: (
            subscription: LitElementStateSubscription<any>
        ) => void
    ) {
        this.path = path;
        this.subscriptionFunction = subscriptionFunction;
        this.unsubscribeFunction = unsubscriptionFunction;
    }
    
    next(value: P) {
        // TODO: only set & emit when change in value happened and not on re-set?
        this.previousValue = LitElementStateService.deepCopy(this.value);
        this.value = value;
        this.emitValue();
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
