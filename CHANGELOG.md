# Changelog
Starts with version 3.4.15, please see commit history for earlier changes.

## [3.4.15]
- Chore: Upgrade lit to 2.7.2

## [3.4.16]
- Chore: Upgrade lit to 3.0.2

## [3.4.17]
- Chore: Upgrade lit to 3.1.1

## [4.0.0]
- Feat(set-state): Added options parameter with entryPath for easier state navigation
- Feat(set-state): Correctly type and describe entryPath
- Feat(deepReduce): Exempt "Element"
- Chore(deps): Upgrade dependencies
- Chore(Readme): Fix typos
- Chore(deps): Bump versions
- Fix(types): Add StateEntryPath type
- Fix(types): Refine State EntryPath type
- WIP(state-path): Replace all other path definitions by StatePath
- fix(getSubscriptionData): Fix condition for array index segments
- fix(litElementStateful): Fix typing
- Chore(Changelog): Add breaking changes
 
### 🚨 BREAKING CHANGE:
This version replaces the parameter based targeting of state with an array based approach, the new ``StatePath`` interface.
To subscribe state the function call was:
```
LitElementStateful.connectState(
    "path", "to", "my", "state", "myLitElementProperty", { options }
)

or

LitElementStateful.subscribeState(
    "path", "to", "my", "state", "myLitElementProperty", stateChange => { ...do something with stateChange... },  { options }
)

or

LitElementStateService.subscribe(
    "path", "to", "my", "state", stateChange => { ...do something with stateChange... }, { options }
)
```

This becomes:

```
LitElementStateful.connectState(
    ["path", "to", "my", "state"], "myLitElementProperty", { options }
)

or

LitElementStateful.subscribeState(
    ["path", "to", "my", "state"], "myLitElementProperty", stateChange => { ...do something with stateChange... },  { options }
)

or

LitElementStateService.subscribe(
    ["path", "to", "my", "state"], stateChange => { ...do something with stateChange... }, { options }
)
```
This makes it easier to type the path and also to reuse paths as variables.

### 🚨 BREAKING CHANGE:
This version moves the cacheHandler parameter on the ``LitElementStateful.setState`` & ``LitElementStateService.set`` methods into a ``SetStateOptions`` object.
When cacheHandlers have been used like e.g.:
```
setSate(
    { myProp: 'test' }, 
    'myCacheHandlerName'
)
```
the usages have to be re-written to:
```
setSate(
    { myProp: 'test' }, 
    { cacheHandlerName: 'myCacheHandlerName' }
)
```
## [4.0.1]
- Chore(Readme): Update Readme
- Chore: Update version
- Fix(typing): Reduce typing support for StatePath to 10 levels max

## [4.0.2]
- Fix(typing): Reduce typing support for StatePath to 6 levels max

## [4.0.3]
- Fix(typing): Revert to recursive type with additional condition

## [4.0.4]
- Fix(typing): Make state object "Required" in StatePath

## [5.0.0]
- Fix(StatePath): Change to non-recursive typing, revert array element selection

### 🚨🚨: I strongly recommend not using v4 and upgrade to this version

### 🚨 BREAKING CHANGE:
Since recursive typing proved to be super slow for large states and impossible to properly use intellisense, 
I had to revert to multiple function overloads.
As a consequence the StatePath array element selection had to be changed / reverted:
```
['library', 'books', 1] or ['library', 'books', book => book.title === 'Harry Potter']
```
Needs to be reverted to that:
```
['library', { array: 'books', get: 1}] or ['library', { array: 'books', get: book => book.title === 'Harry Potter'}]
```

## [5.0.1]
- Fix(deep-reduce): Add Date to exceptions from deepReduce

## [5.0.2]
- fix(cacheHandlers): Improve array handling for localstorage cacheHandler
- fix(cacheHandlers): Fix typing error in localstorage cacheHandler

## [5.0.3]
- fix(cacheHandlers): Fix array merge error in localstorage cacheHandler

## [5.0.4]
- fix(cacheHandlers): Fix path creation in localstorage cacheHandler

## [5.0.5]
- fix(cacheHandlers): Fix path creation in localstorage cacheHandler

## [5.0.6]
- fix(cacheHandlers): Take full path in localstorage cacheHandler on array update

## [5.0.7]
- fix(cacheHandlers): Fix loading of array from localstorage

## [5.0.8]
- chore(deps): Bump versions

## [5.0.9]
- fix(deepCompare): handle NaN
- chore(deps): Bump versions

## [5.1.0]
- chore(deps): Bump versions
- feat(cacheHandlers): Allow exceptions from caching

## [5.1.1]
- fix(localStorageCacheHandler): fix array handling

## [5.1.2]
- fix(localStorageCacheHandler): add missing null check