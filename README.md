# lit-state
A lightweight reactive state management for Lit

<h1>Installation</h1>

```
npm install @stefanholzapfel/lit-state
```

<h1>Initiate</h1>

Create an interface that represents your state, e.g.:
```
interface State {
    app?: AppState;
    books?: { 
        data: Book[],
        bookCount?: number; 
    };
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
}

export interface Author {
    name?: string;
}
```
You can nest the state as deep as you want.

Somewhere in your app (before using the state), instantiate a LitElementStateService via:
```
new LitElementStateService<State>(
    // Initial state
    {
        app: {
            offline: false,
            mobile: false
        }
    },
    // Default options for subscriptions
    {
        global: true
    }
);
```
You can either hold a reference to the newly created service or set the global flag in the state config to "true".
With the global flag set, lit-state will hold a reference for you and use it as default service when you provide none.

The second param overwrites the default options for all subscriptions to the state:
```
{
    getInitialValue: true, // Receive the current value upon subscription or only later changes?
    pushNestedChanges: false, // Receive changes in nested properties of the subscribed state partial?
    getDeepCopy: false, // Get a reference or a deep copy on state change?
    autoUnsubscribe: true // Automatically unsubscribe when the component a subscription lives in is disconnected?
}
```

# Consume state

There are two ways to consume the state:

## 1. Directly
Use the state via a reference:
```
litService.state() // Returns the whole State object

const subscription = litService.subscribe('app', 'offline', value => {
    value.previous // the value before change
    value.current // the new value
}) 
```

When subscribing to LitElementStateService, provide the path to the "partial" of the state to observe.
One string param per nested property. The depth of the "subscription path" for now is limited to six, since I didn't find another way to type the mehtod than overriding the function 
multiple times (suggestions for improvement very welcome!).

As third param you could again override the default subscription params (see chapter "Initiate").

Don't forget to unsubscribe when you dont wan't to listen for state changes anymore, or you get memory leaks:
```
subscription.unsubscribe();
```

## 2. In lit-element
lit-state comes with a class that extends LitElement. You can create your lit-element like this:
```
export class MyComponent extends LitElementStateful<State> {
    constructor() {
        super();
    }
}
```
Then you can provide a reference to a LitElementStateService in the constructor.
If you have created a global LitElementStateService, you don't have to provide any service
since lit-state will automatically take that one (but you still can if you like).

```
export class MyComponent extends LitElementStateful<State> {
    @state()
    private mobile;
    
    constructor() {
        super();
        this.subscribeState('app', 'mobile', value => {
            value.previous // the value before change
            value.current // the new value
            this.mobile = value.current;
        })
        this.connectState('app', 'mobile', 'mobile');
    }
}
```

As you see in the example above you now have two ways to subscribe the state: 

```this.subscribeState()``` works the same as when using litService.subscribe directly

```this.connectState()``` will automatically connect the state partial defined to the lit-element's 
property in the last string parameter. The property to connect to must be a @property / @state in your lit-element.
requestUpdate() will automatically be called on every change and un-subscription also happens automatically when the component is disconnected.

Now just use the e.g. ```@state() mobile``` in your element as you would normally do.


<h1> Manipulate state </h1>

<h2> 1. Directly </h2>

Again, use the reference kept from instantiation.

To set new values in the state, just provide the new partial you want to replace, e.g.:
```
litService.set({
    app: {
        mobile: true,
        offline: true
    }
})
```

The changes will get merged into the existing state, meaning the other properties in "app" stay untouched.

In some cases you want to replace a property with nested objects as a whole. For that, there is the "_reducerMode"
flag. This keyword is reserved and shouldn't be used in your state.

An example:

On this state...

```
{
    app: {
        mobile: true,
        offline: true
    },
    books: { 
        data: [
            {
                name: 'Testbook'
                ...
            },
            {
                name: 'Testbook2'
                ...
            },
        ],
        bookCount: 2; 
    };            
}
```

...this operation...

```
stateService.set({
    app: {
        _reducerMode: 'merge' // Default: not necessary, just for demo purposes
        mobile: false
    },
    books: {
        _reducerMode: 'replace', // Replaces the property "books" with the given object
        bookCount: 0; 
    };            
})
```

... gives that resulting state:

```
{
    app: {
        mobile: false,
        offline: true
    },
    books: {        
        bookCount: 0; 
    };            
}
```

**Note**: You shouldn't use "_reducerMode" or "_arrayOperation" properties nested in a { _reducerMode: 'replace' } branch, 
since this branch as a whole will be replaced and this special properties won't be handled.

<h2> 2. In lit-element </h2>

Same as using directly, just use the method ```this.setState()``` instead.

<h1>Array operations</h1>

Since I found it very cumbersome to subscribe / mutate array elements, I implemented array operators.

<h2> Subscribing array elements </h2>
To subscribe to a specific element in an array, you can provide a predicate function. The subscription will use the
first element for which the function returns true. The syntax is:

```
 type ArraySubscriptionPredicate<ArrayName, ElementType> = { array: ArrayName, predicate: PredicateFunction<ElementType> };
 type PredicateFunction<ArrayType> = (array: ArrayType, index?: number) => boolean;
```

Example:
```
this.subscribeState('books', { array: 'data', predicate: (book, index) => book.author === 'Me' || index === 10  }, value => {
    value.previous // the value before change
    value.current // the new value
})
```

**Hint**: You can use array predicate function multiple times in the path (subscribe to elements in nested arrays). If you
provide a string instead of the predicate object on an array, you will subscribe to the whole array. When you subscribe to
an array as a whole, this is the last segment in the path.

<h2> Manipulating array elements </h2>
In your state changes you can also use this syntax to update, push or pull (remove) array elements:

```
{
    _arrayOperation:
        { op: 'update', at: PredicateFunction<State[number]> | number, val: StateChange<State[number]> | ((element: State[number]) => StateChange<State[number]>) } |
        { op: 'push', at?: number, val: State[number] } |
        { op: 'pull', at?: PredicateFunction<State[number]> | number }
}
```

Example:
```
stateService.set({
    books: {
        data: {
            _arrayOperation: { op: 'update', at: book => book.author === 'Mark Twain', val: book => book.title === 'Tom Sawyer' ? { title: "Huckleberry Finn" } : {} }
        }
    };            
})
```

**Hint**: You can also nest those operations and use the _reducerMode property in the "val" object. 

<h1>(WIP) Persist state</h1>

NOT FINISHED - DON'T USE!!

To persist state and reload it on service instantiation provide an array of cache handlers in the state option's ```cache``` property.

Optionally you can also provide a name to enable the cache handler to use different persistent caches for different state services.

Example:
```
new LitElementStateService<State>({
                exampleState: {
                    offline: false,
                    mobile: false
                }
            },
            {
                global: true,
                cache: {
                    name: 'myState1',
                    handlers: [
                        new LocalStorageCacheHandler<State>()
                    ]
                }
            }));
```

The LocalStorageCacheHandler is provided with this package (others may follow). You can implement your own following the
```CachHandler``` interface.

If you provide multiple handlers, they will load their initial state in the order you provide them (and therefore may overwrite each other).

To persist a state change provide the name of the cache handler to use:

```
stateService.set(
    { exampleState: { offline: true } },
    'localstorage'
)
```
or in LitElementStateful:
```
this.setState(
    { exampleState: { offline: true } },
    'localstorage'
)
```

The handler name is the ```name``` property of the cache handler. 

The cache handler has to be provided when instantiating the service,
otherwise you will get an error.
