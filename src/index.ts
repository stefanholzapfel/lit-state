import {LitElementStateService} from './litElementState.service';
import {DeepPartial} from 'ts-essentials';

export interface StateConfig<State> {
    cache?: {
        name?: string;
        handlers: CacheHandler<State>[];
    };
    defaultSubscribeOptions?: SubscribeStateFromElementOptions;
    global: boolean;
}

export interface CacheHandler<State> {
    name: string;

    set(change: DeepPartial<StateChange<State>>, stateServiceInstance: LitElementStateService<State>);

    load(stateServiceInstance: LitElementStateService<State>): StateChange<State> | DeepPartial<StateChange<State>>;
}

export type StateSubscriptionFunction<P> = (
    value: Change<P>
) => void;

export interface Change<P> {
    readonly previous: P | null
    readonly current: P | null
}

export type StateReducerMode = 'merge' | 'replace';

export type PredicateFunction<ArrayType> = (array: ArrayType, index?: number) => boolean;
export type ArraySubscriptionPredicate<ArrayName, ElementType> = { array: ArrayName, predicate: PredicateFunction<ElementType> };

export interface SubscribeStateOptions {
    getInitialValue?: boolean;
    // Set true to trigger changes when a sub-property of a subscribed property changes
    pushNestedChanges?: boolean;
    getDeepCopy?: boolean;
}

export interface SubscribeStateFromElementOptions extends SubscribeStateOptions {
    autoUnsubscribe?: boolean;
}

export type StateChange<State> =
    State extends Array<any> ?
        {
            _arrayOperation:
                { op: 'update', at: PredicateFunction<State[number]> | number, val: StateChange<State[number]> | ((element: State[number]) => StateChange<State[number]>) } |
                { op: 'push', at?: number, val: State[number] } |
                { op: 'pull', at?: PredicateFunction<State[number]> | number }
        } |
        State :
        {
            [P in keyof State]?:
            State[P] | StateChange<State[P]>
        } & { _reducerMode?: StateReducerMode };

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
