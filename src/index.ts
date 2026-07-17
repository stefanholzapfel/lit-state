import {LitElementStateService} from './litElementState.service.js';

export interface StateConfig<State> {
    cache?: {
        name?: string;
        exceptions?: RegExp[];
        handlers: CacheHandler<State>[];
    };
    defaultSubscribeOptions?: SubscribeStateFromElementOptions;
    global: boolean;
}

export interface CacheHandler<State> {
    name: string;
    set(change: StateChange<State>, stateServiceInstance: LitElementStateService<State>): void;
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

// ─── Typed state paths ──────────────────────────────────────────────────────
//
// One generic signature per path method (subscribe / get / subscribeState /
// connectState):
//
//   method<const P extends StatePathConstraint<State>>(path: CheckedStatePath<State, P>, ...)
//
// The given path is validated segment by segment — linear in the path length
// (possible paths of State are NEVER enumerated). String literals are kept
// without `as const`, optional properties work at any depth, there is no depth
// cap, and selector predicates (`get: field => ...`) are auto-typed without
// parameter annotations.
//
// LOAD-BEARING INVARIANTS — established empirically on TS 5.9/6.0 and guarded
// by the suite in type-tests/. Referenced below as [1]..[6]:
// [1] An unannotated predicate makes the path literal context-sensitive, so it
//     is contextually typed BEFORE P can be inferred. That context can only
//     come from P's CONSTRAINT, which therefore must be a PLAIN union (never
//     intersected into the parameter type — discrimination fails through
//     intersections) and a DISTRIBUTIVE conditional on State (otherwise the
//     receiver's State is not substituted on generic classes).
// [2] Selector shapes in that union must be INLINE. Alias chains
//     (ArrayElementSelector -> IndexOrPredicateFunction -> PredicateFunction)
//     reach the literal un-instantiated and kill discrimination.
// [3] The discriminant may match only ONE member carrying a call signature,
//     or the checker drops the contextual signature entirely. Hence:
//     AllowedSegments is KEYS-ONLY (leaked selector members would collide),
//     same-named arrays are MERGED into one member (element union), and
//     pattern keys — index signatures / template-literal keys, which match
//     every literal name — are SIGNATURE-FREE (`get: unknown`).
// [4] `| Function` in a merged member admits predicates annotated with one of
//     the colliding element types (parameter contravariance would reject them
//     against the union parameter) while adding no call signature; the
//     position-exact final check still rejects mismatches.
// [5] Pattern-key entries carry a DIFFERENT tag than literal entries: a plain
//     `string` name in the same union would absorb every literal name
//     (`'data' | string` reduces to `string`).
// [6] `never extends readonly any[]` and `any extends readonly any[]` are both
//     true — never-/any-typed properties must be guarded out of array checks.

/** Loose path shape: used by the implementation signatures,
 *  LitElementStateSubscription.path and SetStateOptions.entryPath. */
export type StatePath<State> = readonly (string | ArrayElementSelector<string, any>)[];

/** True only for `any`. */
type IsAny<T> = 0 extends (1 & T) ? true : false;

/** What the runtime's `Array.isArray` accepts: arrays, readonly arrays, tuples. */
type AnyArray = readonly any[];

/** Element type of an array-typed value. */
type ElementOf<A> = NonNullable<A> extends readonly (infer E)[] ? E : never;

/** Keys of T holding arrays (guards per [6]). */
type ArrayKeys<T> = {
    [K in keyof NonNullable<T>]-?:
        IsAny<NonNullable<T>[K]> extends true ? never :
        NonNullable<NonNullable<T>[K]> extends AnyArray ? K : never
}[keyof NonNullable<T>];

/** Keys of T not holding arrays. */
type NonArrayKeys<T> = Exclude<keyof NonNullable<T>, ArrayKeys<T>>;

/** One type-level step of the runtime path walk. NonNullable first, so optional
 *  intermediates never collapse `keyof` to `never`; invalid segments descend to
 *  `any` so only the segment that is already reported errors, not its suffix. */
type Descend<T, Seg> =
    IsAny<T> extends true ? any :
    Seg extends { array: infer A }
        ? (A extends keyof NonNullable<T> ? ElementOf<NonNullable<T>[A]> : any)
        : (Seg extends keyof NonNullable<T> ? NonNullable<T>[Seg] : any);

/** Value at the end of path P. A plain array key in last position yields the
 *  whole array (mirrors getStateData); non-tuple P (dynamic path) yields any. */
export type StatePathValue<State, P extends readonly unknown[]> =
    number extends P['length'] ? any :
    P extends readonly [infer Head, ...infer Rest]
        ? (Rest extends readonly [unknown, ...unknown[]]
            ? StatePathValue<Descend<State, Head>, Rest>
            : Descend<State, Head>)
        : (IsAny<State> extends true ? any : undefined);

/** Position-exact selector for array key K of T — INLINE shape per [2]. */
type ArraySelectorFor<T, K> =
    K extends keyof NonNullable<T>
        ? { array: K, get: number | ((element: ElementOf<NonNullable<T>[K]>, index?: number) => boolean) }
        : never;

/** All position-exact selectors of one node T. */
type ArraySelectors<T> = { [K in ArrayKeys<T>]: ArraySelectorFor<T, K> }[ArrayKeys<T>];

/** Plain keys allowed at a node: array keys only in last position (whole-array
 *  subscription); mid-path an array requires a selector. KEYS-ONLY per [3]. */
type AllowedSegments<T, IsLast extends boolean> =
    IsLast extends true ? keyof NonNullable<T> : NonArrayKeys<T>;

/** Expected type of one segment: a well-formed selector resolves to its
 *  position-exact shape, everything else to the allowed alternatives — which
 *  drive both the error message and the IDE completions. */
type SegmentOut<T, Seg, IsLast extends boolean> =
    IsAny<T> extends true ? Seg :
    [Seg] extends [{ array: infer A }]
        ? ([A] extends [ArrayKeys<T>] ? ArraySelectorFor<T, A> : ArraySelectors<T>)
        : AllowedSegments<T, IsLast>;

/** Expected tuple for path P (tail-recursive — exempt from the instantiation
 *  depth limit). Non-tuple P degrades to the loose constraint shape; this covers
 *  dynamic path variables AND the transient constraint-fixed moment while a
 *  context-sensitive literal is contextually typed [1] — afterwards P is
 *  inferred from the typed literal, so the final check is position-exact even
 *  for unannotated predicates. The empty path stays an arity error. */
type ValidatePath<State, P, Acc extends readonly unknown[] = readonly []> =
    P extends readonly [infer Head, ...infer Rest]
        ? (Rest extends readonly [unknown, ...unknown[]]
            ? ValidatePath<Descend<State, Head>, Rest, readonly [...Acc, SegmentOut<State, Head, false>]>
            : readonly [...Acc, SegmentOut<State, Head, true>])
        : P extends readonly []
            ? readonly [...Acc, AllowedSegments<State, true>]
            : StatePathConstraint<State>;

/** P itself when it matches the expected tuple (the naked P here carries the
 *  literal inference), otherwise the expected tuple (per-segment errors). */
type ValidateShape<P, Expected> = P extends Expected ? P : Expected;

/** Non-unit string keys: `string` itself and template-literal patterns (a
 *  Record over such a key has no required properties). */
type IsPatternKey<N extends string> = {} extends Record<N, 1> ? true : false;

/** Walk collecting an entry for every array-typed property reachable in T
 *  (depth-capped, linear in the state size, cached per T — NOT a path
 *  enumeration). Literal keys are tagged `array`, pattern keys `patternArray`
 *  per [5]; guards per [6]; numeric/symbol keys are not addressable by the
 *  runtime's string segments. */
type DeepArrayEntries<T, Depth extends readonly unknown[] = []> =
    Depth['length'] extends 10 ? never :
    IsAny<T> extends true ? never :
    NonNullable<T> extends infer U
        ? U extends readonly (infer E)[]
            ? DeepArrayEntries<E, [...Depth, unknown]>
            : U extends object
                ? { [K in keyof U]-?:
                    | (IsAny<U[K]> extends true ? never :
                       [NonNullable<U[K]>] extends [never] ? never :
                       NonNullable<U[K]> extends AnyArray
                            ? (K extends string
                                ? (IsPatternKey<K> extends true
                                    ? { patternArray: K, element: ElementOf<U[K]> }
                                    : { array: K, element: ElementOf<U[K]> })
                                : never)
                            : never)
                    | DeepArrayEntries<U[K], [...Depth, unknown]>
                  }[keyof U]
                : never
        : never;

/** All literal entry names (pattern entries stay out per [5]). */
type EntryNames<Entries> = Entries extends { array: infer N extends string } ? N : never;

/** Union of the element types of every entry named N (same-name merge, [3]). */
type ElementForName<Entries, N extends string> =
    Entries extends { array: N, element: infer E } ? E : never;

/** The name-discriminated selector union that auto-types unannotated predicate
 *  parameters [1]: one MERGED member per literal array name (element union,
 *  [3]; `| Function` per [4]) plus SIGNATURE-FREE members for pattern names
 *  ([3] — their predicates must be annotated). */
type DeepArraySelectors<T> =
    DeepArrayEntries<T> extends infer Entries
        ? [Entries] extends [never]
            ? never
            : | (EntryNames<Entries> extends infer Names
                    ? (Names extends string
                        ? { array: Names, get: number | ((element: ElementForName<Entries, Names>, index?: number) => boolean) | Function }
                        : never)
                    : never)
              | (Entries extends { patternArray: infer PN extends string }
                    ? { array: PN, get: unknown }
                    : never)
        : never;

/** Constraint of the path type parameter: any sequence of keys and well-formed
 *  selectors for arrays existing anywhere in State. Doubles as the contextual
 *  type that auto-types unannotated predicates — plain union + distributive
 *  conditional are both required, see [1]. */
export type StatePathConstraint<State> =
    State extends unknown ? readonly (string | DeepArraySelectors<State>)[] : never;

/** Parameter type of the public path methods: position-exact validation and
 *  value/predicate typing for literal paths (including unannotated predicates,
 *  see ValidatePath); only dynamic (non-literal) paths stay loosely typed. */
export type CheckedStatePath<State, P extends readonly unknown[]> =
    ValidateShape<P, ValidatePath<State, P>>;

// Root entry exposes the service, the stateful element base class, the
// subscription and the shared types. Cache handlers are intentionally NOT
// re-exported here so IDE auto-import and bundlers resolve them via their
// dedicated subpaths, e.g. `@stefanholzapfel/lit-state/localStorageCacheHandler.js`.
export * from './litElementStateful.js';
export * from './litElementState.service.js';
export * from './litElementStateSubscription.js'
