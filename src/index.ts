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
    set(change: StateChange<State>, stateServiceInstance: LitElementStateService<State>);
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

export interface SubscribeStateOptions {
    getInitialValue?: boolean;
    // Set true to trigger changes when a sub-property of a subscribed property changes
    pushNestedChanges?: boolean;
    getDeepCopy?: boolean;
}

export interface SetStateOptions<State> {
    // Ṕrovide the name of a cache handler to use it for persistence with this set state call
    cacheHandlerName?: string;
    entryPath?: StatePath<State>;
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

// Helpers for StatePath type
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type NextDigit = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'STOP'];
type Increment<Depth> = Depth extends Digit ? NextDigit[Depth] : 'STOP';

export type IndexOrPredicateFunction<Type> = number | PredicateFunction<Type>;
export type StatePathKey = IndexOrPredicateFunction<any> | string;
export type StatePath<Object, Path extends (string | IndexOrPredicateFunction<any>)[] = [], Depth = 0> = Object extends object ?
    (Path |
    // Check if depth > max allowed
    (Depth extends string ?
            // ...if yes, don't typecheck deeper levels and allow everything (for performance reasons)
            [...Path, ...any[]] :
            // ...otherwise check if object is array
            (Object extends readonly any[] ?
                // ...when array only allow index or PredicateFunction
                StatePath<Object[number], [...Path, IndexOrPredicateFunction<Object[number]>], Increment<Depth>>
                // ...when object generate type of all possible keys
                : { [Key in string & keyof Object]: StatePath<Object[Key], [...Path, Key], Increment<Depth>> }[string & keyof Object])))
    : Path;

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
