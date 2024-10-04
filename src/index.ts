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

export type StateSubscriptionFunction<SubscribedType> = (
    value: Change<SubscribedType>
) => void;

export interface Change<SubscribedType> {
    readonly previous: SubscribedType | null
    readonly current: SubscribedType | null
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

export type IndexOrPredicateFunction<Type> = number | PredicateFunction<Type>;
export type StatePathKey = IndexOrPredicateFunction<any> | string;

/*
// Helpers for StatePath type
type Digit = 0 | 1 | 2;
type NextDigit = [1, 2, 'STOP'];
type Increment<Depth> = Depth extends Digit ? NextDigit[Depth] : 'STOP';

export type StatePath<State, Path extends (string | IndexOrPredicateFunction<any>)[] = [], Depth = 0> =
    // Check if depth > max allowed
    Depth extends string ?
        // ...if yes, don't typecheck deeper levels and allow everything (for performance reasons)
        [...Path, ...any[]] :
        (object extends Required<State>
                ? Path
                : State extends object
                    ? (Path |
                            // Check if object is array
                            (State extends readonly any[] ?
                                // ...when array only allow index or PredicateFunction
                                StatePath<State[number], [...Path, IndexOrPredicateFunction<State[number]>], Increment<Depth>>
                                // ...when object generate type of all possible keys
                                : { [Key in string & keyof State]: StatePath<State[Key], [...Path, Key], Increment<Depth>> }[string & keyof State]))
                    : Path);


export type StatePath<State, Path extends StatePathKey[] = []> =
    object extends Required<State>
        ? Path
        : State extends object
            ? (Path |
                // Check if object is array
                (State extends readonly any[] ?
                    // ...when array only allow index or PredicateFunction
                    StatePath<State[number], [...Path, IndexOrPredicateFunction<State[number]>]>
                    // ...when object generate type of all possible keys
                    : { [Key in string & keyof State]: StatePath<State[Key], [...Path, Key]> }[string & keyof State]))
            : Path;
*/

export type StatePath<
    State,
    Key1 extends keyof State,
    Type1 extends (State[Key1] extends (infer Type1)[] ? Type1 : State[Key1]),
    ArrayIndex2 extends (State[Key1] extends (infer Type1)[] ? [(number | PredicateFunction<Type1>)] : []),
    Key2 extends keyof Type1,
    Type2 extends (Type1[Key2] extends (infer Type2)[] ? Type2 : Type1[Key2]),
    ArrayIndex3 extends (Type1[Key2] extends (infer Type2)[] ? [(number | PredicateFunction<Type2>)] : []),
    Key3 extends keyof Type2,
    Type3 extends (Type2[Key3] extends (infer Type3)[] ? Type3 : Type2[Key3]),
> =
    | [Key1]
    | [Key1, ...ArrayIndex2]
    | [Key1, ...ArrayIndex2, Key2]
    | [Key1, ...ArrayIndex2, Key2, ...ArrayIndex3]
    | [Key1, ...ArrayIndex2, Key2, ...ArrayIndex3, Key3]

export interface TestState {
    test1: {
        test2: {
            test3: string[];
        };
        test4: {
            test5: string
        };
    }
}

const test: StatePath<TestState> = ["test1", "test2", "test3"];

type PathKeys<T> =
    T extends Array<infer U> ?
        keyof U | number : // Allow keys of the object type or numeric index for arrays
        keyof T; // Allow keys of the object type

// Main Path type
type PathNew2<State> =
    | [keyof State] // Level 1
    | [keyof State, PathKeys<State[keyof State]>] // Level 2
    | [
    keyof State,
    keyof (State[keyof State] extends Array<infer U> ? U : State[keyof State]), // Valid keys from second level
    keyof (State[keyof State] extends Array<infer U> ? U : State[keyof State]) // Valid keys from third level
];

/*
export type StatePathType<State, Path extends StatePathKey[]> =
    Path extends [infer Key, ...infer RemainingPath]
        ? Key extends keyof State
            ? StatePathType<State[Key], RemainingPath>
            : State extends Array<infer ElementType>
                ? Key extends number
                    ? StatePathType<ElementType, RemainingPath>
                    : Key extends PredicateFunction<ElementType>
                        ? StatePathType<ElementType, RemainingPath>
                        : never
                : never
        : State;*/

export * from './litElementStateful';
export * from './litElementState.service';
export * from './litElementStateSubscription'
