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

    set(change: StateChange<State> | DeepPartial<StateChange<State>>, stateServiceInstance: LitElementStateService<State>);

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
            _arrayOperation: { op: 'update', val: State[number] | StateChange<State[number]> , at: PredicateFunction<State[number]> | number }
        } |
        { _arrayOperation: { op: 'push', val: State[number], at?: number } } |
        { _arrayOperation: { op: 'pull', at?: PredicateFunction<State[number]> | number } } |
        State :
            State extends Object ?
                { _reducerMode?: StateReducerMode } &
                {
                    [P in keyof State]?:
                        StateChange<State[P]>
                } : State;

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
