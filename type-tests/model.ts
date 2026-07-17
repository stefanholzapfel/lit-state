// Shared state model for type tests.
// Mirrors the README example plus the exact interfaces from the reported bug.

export interface State {
    app?: AppState;
    books?: {
        data: Book[];
        bookCount?: number;
    };
    // From the reported bug (optional intermediate -> array-free deep path):
    spots?: SpotsState;
    // Extra shapes for edge-case coverage:
    readonlyBooks?: {
        data: readonly Book[];
    };
    pair?: [Book, Author];
    dictionary?: { [key: string]: Book };
    // Index-signature dictionary whose values are ARRAYS with a different element
    // type than other arrays in the state: its union member has a non-literal
    // `array: string` discriminant, which historically poisoned the contextual
    // typing of ALL unannotated selector predicates (must stay signature-free).
    arrayDictionary?: { [key: string]: number[] };
    // A `never`-typed property must not become a selector member (`never extends
    // readonly any[]` is true and would yield `element: never` noise).
    neverProp?: never;
    // SAME ARRAY NAME at two places with DIFFERENT element types: historically the
    // duplicate discriminant made the checker refuse a contextual signature and
    // silently dropped predicate auto-typing everywhere the name was used. The
    // selector union must merge these into one member with the element UNION.
    form?: { fields: FormField[] };
    submission?: { fields: FieldValue[] };
    anyProp?: any;
    unknownProp?: unknown;
}

export interface AppState {
    currentRoute?: string;
    language?: string;
    headerText?: string;
    offline: boolean;
    mobile: boolean;
    user?: User;
}

export interface User {
    username?: string;
    fullName?: string;
}

export interface Book {
    title?: string;
    author?: Author;
    tags?: string[];
}

export interface Author {
    name?: string;
}

export interface SpotsState {
    lists: {
        selectedType?: SpSpotListType;
    };
}

export interface FormField {
    name: string;
    type?: string;
}

export interface FieldValue {
    fieldId: number;
    value: string;
}

export type SpSpotListType = 'visible' | 'latest' | 'cluster' | 'user';
