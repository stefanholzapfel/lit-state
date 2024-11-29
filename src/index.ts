import {LitElementStateService} from './litElementState.service';

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
    set(change: StateChange<State>, options: SetStateOptions<State>, stateServiceInstance: LitElementStateService<State>);
    load(stateServiceInstance: LitElementStateService<State>): StateChange<State>;
}

export type StateSubscriptionFunction<StatePart> = (
    value: Change<StatePart>
) => void;

export interface Change<P> {
    readonly previous: P | null
    readonly current: P | null
}

export type StateReducerMode = 'merge' | 'replace';

export type PredicateFunction<ArrayType> = (array: ArrayType, index?: number) => boolean;
export type IndexOrPredicateFunction<Type> = number | PredicateFunction<Type>;
export type ArrayElementSelector<ArrayName, ElementType> = { array: ArrayName, get: IndexOrPredicateFunction<ElementType> };

export interface GetStateOptions {
    getDeepCopy?: boolean;
}

export interface SubscribeStateOptions extends GetStateOptions {
    getInitialValue?: boolean;
    // Set true to trigger changes when a sub-property of a subscribed property changes
    pushNestedChanges?: boolean;
}

export interface SubscribeStateFromElementOptions extends SubscribeStateOptions {
    autoUnsubscribe?: boolean;
}

export interface SetStateOptions<State> {
    // Ṕrovide the name of a cache handler to use it for persistence with this set state call
    cacheHandlerName?: string;
    entryPath?: StatePath<State>;
}

export type StateChange<State> =
    State extends Array<any> ?
        {
            _arrayOperation:
                { op: 'update', at: IndexOrPredicateFunction<State[number]>, val: StateChange<State[number]> | ((element: State[number]) => StateChange<State[number]>) } |
                { op: 'push', at?: number, val: State[number] } |
                { op: 'pull', at?: IndexOrPredicateFunction<State[number]> }
        } |
        State :
        {
            [P in keyof State]?:
            State[P] | StateChange<State[P]>
        } & { _reducerMode?: StateReducerMode };

// TODO: Properly type that so StatePath correlates with the generic inputs of the subscription & get overloads
export type StatePath<State> = readonly (string | ArrayElementSelector<string, any>)[];

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
