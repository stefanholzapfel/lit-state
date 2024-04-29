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
### BREAKING CHANGE:
This commit moves the cacheHandler attribute on the LitElementStateful.setState & LitElementStateService.set methods into an options object.
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
