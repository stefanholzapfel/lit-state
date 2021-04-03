import { DeepPartial } from 'ts-essentials';

export type StateSubscriptionFunction<P> = (
    value: StateChange<P>
) => void;

export interface StateChange<P> {
    readonly previous: P | null
    readonly current: P | null
}

export type CustomStateReducer<State> = (state: State, partialClone: DeepPartial<ReducableState<State>>) => State;
export type StateReducerMode = 'merge' | 'replace';

export interface SubscribeStateOptions {
    getInitialValue?: boolean;
    // Set true to trigger changes when a sub-property of a subscribed property changes
    pushNestedChanges?: boolean;
    getDeepCopy?: boolean;
}

export interface SubscribeStateFromElementOptions extends SubscribeStateOptions {
    autoUnsubscribe?: boolean;
}

export type ReducableState<State> = {
    [P in keyof State]?: State[P] &
    {
        _reducerMode?: StateReducerMode;
    } | ReducableState<State[P]>
};

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
