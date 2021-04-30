export interface StateConfig {
    cache?: {
        prefix?: string;
        load?: CacheMode[];
    };
    defaultSubscribeOptions?: SubscribeStateFromElementOptions;
    global: boolean;
}

export interface CacheHandler {
    set(path: string[], value: any);
    unset(path: string[]);
    load(path: string[]): any;
}

export type StateSubscriptionFunction<P> = (
    value: StateChange<P>
) => void;

export interface StateChange<P> {
    readonly previous: P | null
    readonly current: P | null
}

export type StateReducerMode = 'merge' | 'replace';
export type CacheMode = 'localStorage';

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
