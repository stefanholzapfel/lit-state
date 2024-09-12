# Changelog
Starts with version 3.4.15, please see commit history for earlier changes.

## [3.4.15]
- Chore: Upgrade lit to 2.7.2

## [3.4.16]
- Chore: Upgrade lit to 3.0.2

## [3.4.17]
- Chore: Upgrade lit to 3.1.1

## [4]
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
- 
### BREAKING CHANGE:
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

### BREAKING CHANGE:
This version moves the cacheHandler attribute on the LitElementStateful.setState & LitElementStateService.set methods into an options object.
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
