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

export type StateSubscriptionFunction<P> = (
    value: Change<P>
) => void;

export interface Change<P> {
    readonly previous: P | null
    readonly current: P | null
}

export type StateReducerMode = 'merge' | 'replace';

export type PredicateFunction<ArrayType> = (array: ArrayType, index?: number) => boolean;
export type IndexOrPredicateFunction<Type> = number | PredicateFunction<Type>;
export type ElementSelector<ArrayName, ElementType> = { array: ArrayName, get: IndexOrPredicateFunction<ElementType> };

export interface SubscribeStateOptions {
    getInitialValue?: boolean;
    // Set true to trigger changes when a sub-property of a subscribed property changes
    pushNestedChanges?: boolean;
    getDeepCopy?: boolean;
}

export interface SetStateOptions<State> {
    // Ṕrovide the name of a cache handler to use it for persistence with this set state call
    cacheHandlerName?: string;
    entryPath?: any;
}

export interface SubscribeStateFromElementOptions extends SubscribeStateOptions {
    autoUnsubscribe?: boolean;
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

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type NextDigit = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'STOP'];
type Increment<Depth> = Depth extends Digit ? NextDigit[Depth] : 'STOP';

export type K1<State> = keyof State;
export type T1<State> = State[K1<State>] extends Array<any> ? State[K1<State>][number] : State[K1<State>];
export type K2<State> = keyof T1<State>;
export type T2<State> = T1<State>[K2<State>] extends Array<any> ? T1<State>[K2<State>][number] : T1<State>[K2<State>];
export type K3<State> = keyof T2<State>;
export type T3<State> = T2<State>[K3<State>] extends Array<any> ? T2<State>[K3<State>][number] : T2<State>[K3<State>];
export type K4<State> = keyof T3<State>;
export type T4<State> = T3<State>[K4<State>] extends Array<any> ? T3<State>[K4<State>][number] : T3<State>[K4<State>];
export type K5<State> = keyof T4<State>;
export type T5<State> = T4<State>[K5<State>] extends Array<any> ? T4<State>[K5<State>][number] : T4<State>[K5<State>];
export type K6<State> = keyof T5<State>;

export type StateEntryPath2<State, Path extends (PropertyKey | ElementSelector<any, any>)[] = []> = [
    State[K1<State>] extends Array<any> ? ElementSelector<K1<State>, T1<State>> : K1<State>,
    T1<State>[K2<State>] extends Array<any> ? ElementSelector<K2<State>, T2<State>> : K2<State>,
    T2<State>[K3<State>] extends Array<any> ? ElementSelector<K3<State>, T3<State>> : K3<State>,
    T3<State>[K4<State>] extends Array<any> ? ElementSelector<K4<State>, T4<State>> : K4<State>,
    T4<State>[K5<State>] extends Array<any> ? ElementSelector<K5<State>, T5<State>> : K5<State>,
    K6<State>
]
/*
export type GetElement<State extends object, Key extends string> = State[Key] extends readonly any[] ? ElementSelector<Key, State[Key]> : State[Key];

export type StateEntryPath<State, Path extends (PropertyKey | ElementSelector<any, any>)[] = [], Key extends keyof State> =
    [
        GetElement<State, Key>,
        ...[ , StateEntryPath<any, any> ]
    ]

export type StateEntryPathx<Object, Path extends (PropertyKey | PredicateFunction<any>)[] = [], Depth = 0> = Object extends object ?
    Path |
    // Check if depth > max allowed
    (Depth extends string ?
        // ...if yes, don't typecheck deeper levels and allow everything (for performance reasons)
        [...Path, ...any[]] :
        // ...otherwise check if object is array
        (Object extends readonly any[] ?
            // ...when array only allow index or PredicateFunction
            StateEntryPath<Object[number], [...Path, IndexOrPredicateFunction<Object[number]>], Increment<Depth>>
            // ...when object generate type of all possible keys
            : { [Key in keyof Object]: StateEntryPath<Object[Key], [...Path, Key], Increment<Depth>> }[keyof Object]))
    : Path;
*/

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
