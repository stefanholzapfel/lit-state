// Type-level tests for the path API. Run with `tsc --noEmit` (see tsconfig.*.json here).
// No runtime assertions: everything is checked by the compiler. `@ts-expect-error`
// lines MUST produce an error; every other line MUST compile cleanly.

// Import the BUILT package (../dist), i.e. exactly what a consumer sees. This
// checks the emitted .d.ts under a strict consumer config, rather than
// re-typechecking the library's (intentionally non-strict) source. Run
// `npm run build` before these tests.
import { LitElementStateService, LitElementStateful, StatePathValue } from '../dist/index';
import { State, Book, Author, SpSpotListType } from './model';

// ── assertion helpers ────────────────────────────────────────────────────
type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
declare function expectType<T>(value: T): void;

declare const svc: LitElementStateService<State>;

// ── StatePathValue identities ────────────────────────────────────────────
type _v1 = Expect<Equal<StatePathValue<State, ['app', 'offline']>, boolean>>;
type _v2 = Expect<Equal<StatePathValue<State, ['app', 'user', 'username']>, string | undefined>>;
type _v3 = Expect<Equal<StatePathValue<State, ['spots', 'lists', 'selectedType']>, SpSpotListType | undefined>>;
type _v4 = Expect<Equal<StatePathValue<State, ['books', 'data']>, Book[]>>;
type _v5 = Expect<Equal<StatePathValue<State, ['books', { array: 'data'; get: 0 }]>, Book>>;
type _v6 = Expect<Equal<StatePathValue<State, ['books', { array: 'data'; get: 0 }, 'author', 'name']>, string | undefined>>;
type _v7 = Expect<Equal<StatePathValue<State, ['readonlyBooks', { array: 'data'; get: 0 }]>, Book>>;

// ── positive call sites ──────────────────────────────────────────────────

// The reported bug: path through an optional intermediate property (`app?:`).
svc.subscribe(['app', 'offline'], v => expectType<boolean | null>(v.current));
svc.subscribe(['app', 'user', 'username'], v => expectType<string | undefined | null>(v.current));

// The reported bug, verbatim interfaces: spots? -> lists -> selectedType?.
svc.subscribe(['spots', 'lists', 'selectedType'], v => expectType<SpSpotListType | undefined | null>(v.current));

// Whole array as the last plain segment.
svc.subscribe(['books', 'data'], v => expectType<Book[] | null>(v.current));

// Array element by numeric index.
svc.subscribe(['books', { array: 'data', get: 10 }], v => expectType<Book | null>(v.current));

// Array element by predicate with ANNOTATED params: full position-exact path
// validation and exact value type.
svc.subscribe(['books', { array: 'data', get: (book: Book, index?: number) =>
    book.title === 'x' || index === 0
}], v => expectType<Book | null>(v.current));

// Array element by predicate with UNANNOTATED params: the params are auto-typed
// via the state-wide selector union in P's constraint (discriminated by the
// `array` name). After the predicate is contextually typed, P is inferred from
// the then fully-typed literal — so validation stays position-exact and the
// value type stays exact too.
svc.subscribe(['books', { array: 'data', get: (book, index) => {
    expectType<Book>(book);
    expectType<number | undefined>(index);
    return book.title === 'x' || index === 0;
} }], v => {
    const exact: Book | null = v.current;
    // @ts-expect-error — v.current is exactly Book | null, NOT `any`
    const notAny: number = v.current;
});
// The auto-typed param is REALLY typed, not silently `any`:
svc.subscribe(['books', { array: 'data', get: book => {
    // @ts-expect-error — `nope` does not exist on Book
    return book.nope === 1;
} }], v => {});
// Position-exact validation still applies to paths containing unannotated predicates:
// @ts-expect-error — typo'd key in a path with an unannotated predicate
svc.subscribe(['app', 'usr', { array: 'data', get: b => true }], v => {});

// COLLIDING array names (same name, different element types at two places):
// unannotated predicate param is the UNION of the colliding element types.
import { FormField, FieldValue } from './model';
svc.subscribe(['form', { array: 'fields', get: f => {
    expectType<FormField | FieldValue>(f);
    return 'name' in f && f.name === 'x';
} }], v => {});
svc.subscribe(['form', { array: 'fields', get: f => {
    // @ts-expect-error — fieldId does not exist on FormField (param is NOT silent any)
    return f.fieldId === 1;
} }], v => {});
// annotated with the position-correct colliding type: exact value typing
svc.subscribe(['form', { array: 'fields', get: (f: FormField) => f.name === 'x' }],
    v => expectType<FormField | null>(v.current));
// @ts-expect-error — predicate annotated with the WRONG colliding type for this position
svc.subscribe(['form', { array: 'fields', get: (f: FieldValue) => f.fieldId === 1 }], v => {});
// @ts-expect-error — nonsense function still rejected by position-exact validation
svc.subscribe(['form', { array: 'fields', get: (a: number, b: string, c: boolean) => 'nope' }], v => {});
// ...and get() value types stay exact through unannotated predicates:
const gExact: Author | undefined = svc.get(['books', { array: 'data', get: b => b.title === 'x' }, 'author']);
// @ts-expect-error — result is exactly Author | undefined, NOT `any`
const gNotAny: number = svc.get(['books', { array: 'data', get: b => b.title === 'x' }, 'author']);
// ...and this also holds on LitElementStateful methods (the original bug report):
declare const comp2: LitElementStateful<State>;
comp2.connectState(['spots', 'lists', 'selectedType'], 'anyProp');
comp2.subscribeState(['books', { array: 'data', get: book => book.title === 'x' }], v => {});

// Selector mid-path, then plain keys after it.
svc.get(['books', { array: 'data', get: 0 }, 'author', 'name']);
const _g: string | undefined = svc.get(['books', { array: 'data', get: 0 }, 'author', 'name']);

// readonly array property accepts a selector (matches runtime Array.isArray).
svc.subscribe(['readonlyBooks', { array: 'data', get: 0 }], v => expectType<Book | null>(v.current));

// tuple property (`pair` is itself the array at the root) accepts a selector;
// element type is the tuple member union.
svc.subscribe([{ array: 'pair', get: 0 }], v => expectType<Book | Author | null>(v.current));

// index-signature node: any string key is accepted.
svc.subscribe(['dictionary', 'anything'], v => expectType<Book | null>(v.current));

// `any` / `unknown` typed nodes.
svc.subscribe(['anyProp', 'whatever', 'deep'], v => {});
svc.subscribe(['unknownProp'], v => expectType<unknown>(v.current));

// depth beyond the old 6-level subscribe cap (7 segments through arrays + optionals).
svc.subscribe(['books', { array: 'data', get: 0 }, 'author', 'name'], v => {});

// ── LitElementStateful mirror ────────────────────────────────────────────
class Comp extends LitElementStateful<State> {
    selectedType?: SpSpotListType;
    offline = false;
    demo() {
        this.subscribeState(['spots', 'lists', 'selectedType'], v =>
            expectType<SpSpotListType | undefined | null>(v.current));
        this.connectState(['spots', 'lists', 'selectedType'], 'selectedType');
        this.connectState(['app', 'offline'], 'offline');
    }
}

// ── set() / setState() with typed entryPath ──────────────────────────────
svc.set(true, { entryPath: ['app', 'offline'] });                                  // leaf value at typed path
svc.set(0, { entryPath: ['books', 'bookCount'] });                                 // README example
svc.set({ username: 'x' }, { entryPath: ['app', 'user'] });                        // partial at object path
svc.set({ title: 'x' }, { entryPath: ['books', { array: 'data', get: 0 }] });      // selector in entry path
svc.set({ app: { offline: true } });                                               // whole-state, no entryPath
svc.set({ app: { offline: true } }, { cacheHandlerName: 'localstorage' });         // other options only
declare const comp3: LitElementStateful<State>;
comp3.setState(true, { entryPath: ['app', 'offline'] });
comp3.setState({ app: { offline: true } });
// @ts-expect-error — typo in entry path
svc.set(true, { entryPath: ['app', 'offlin'] });
// @ts-expect-error — value type does not match the path's end
svc.set('yes', { entryPath: ['app', 'offline'] });
// @ts-expect-error — plain array key mid-path in entry path needs a selector
svc.set({ title: 'x' }, { entryPath: ['books', 'data', 'title'] });
// @ts-expect-error — typo in entry path (stateful mirror)
comp3.setState(true, { entryPath: ['app', 'offlin'] });

// ── negative cases (each MUST error) ─────────────────────────────────────

// @ts-expect-error — typo'd key
svc.subscribe(['app', 'offlin'], v => {});

// @ts-expect-error — plain key to an array MID-path (must demand a selector)
svc.get(['books', 'data', 'title']);

// @ts-expect-error — selector on a non-array property
svc.subscribe(['books', { array: 'bookCount', get: 0 }], v => {});

// @ts-expect-error — selector with a wrong array name
svc.subscribe(['books', { array: 'nope', get: 0 }], v => {});

// @ts-expect-error — selector at root on a non-array property
svc.subscribe([{ array: 'app', get: 0 }], v => {});

// @ts-expect-error — empty path
svc.subscribe([], v => {});

// @ts-expect-error — key that does not exist at this level
svc.subscribe(['app', 'title'], v => {});

export {};
