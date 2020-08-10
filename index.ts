import {DeepPartial, DeepReadonly} from 'ts-essentials';

export type LitElementStateSubscriptionFunction<P> = (
    value: StateChange<P>
) => void;

export interface StateChange<P> {
    readonly previous: DeepReadonly<P> | null
    readonly current: DeepReadonly<P> | null
}

export type CustomStateReducer<State> = (state: State, partialClone: DeepPartial<ReducableState<State>>) => State;
export type StateReducerMode = 'merge' | 'replace'

export interface SubscribeStateOptions {
    getInitialValue: boolean;
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
