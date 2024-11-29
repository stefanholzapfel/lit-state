import {CacheHandler, LitElementStateService, SetStateOptions, StateChange} from '../index';
import {isExceptionFromDeepReduce, isObject} from '../litElementState.helpers';
import {DeepPartial} from 'ts-essentials';

const LOCALSTORAGE_PREFIX = 'lit-state';

class LocalStorageCacheHandler<State> implements CacheHandler<State> {
    // TODO: ensure that this works with array feature
    name = 'localstorage';
    private localStorageKeys = new Set<string>();

    load(stateServiceInstance: LitElementStateService<State>): StateChange<State> {
        const res = {} as DeepPartial<State>;
        const fullPrefix = this.getFullPrefix(stateServiceInstance);
        for (const key in localStorage) {
            if (key.startsWith(fullPrefix)) {
                this.localStorageKeys.add(key);
                const path = key.substring(fullPrefix.length).split('.');
                const entry = JSON.parse(localStorage.getItem(key));
                switch (entry.t) {
                    case 'boolean':
                        this.setValue(res, path, entry.v === true);
                        break;
                    case 'number':
                        this.setValue(res, path, +entry.v);
                        break;
                    case 'string':
                    case 'array':
                        this.setValue(res, path, entry.v);
                        break;
                }
            }
        }
        return res as any;
    }

    private setValue(object: DeepPartial<State>, path: string[], value: any) {
        path.forEach((segment, index) => {
            if (index === path.length - 1) {
                object[segment] = value;
            } else {
                if (!object.hasOwnProperty(segment)) {
                    object[segment] = {};
                }
                object = object[segment];
            }
        });
    };

    set(change: StateChange<State>, stateServiceInstance: LitElementStateService<State>) {
        let prependedCount = 1;
        const path = [ LOCALSTORAGE_PREFIX ];
        if (!!stateServiceInstance?.config?.cache?.name) {
            path.push(stateServiceInstance.config.cache.name);
            prependedCount++;
        }
        this.setRecursive(change, path, stateServiceInstance, prependedCount);
    }

    private setRecursive(change: StateChange<State>, path: string[], stateServiceInstance: LitElementStateService<State>, prependedCount: number) {
        for (const key in change as any) {
            const fullPath = [ ...path, key ];
            const pathString = fullPath.join('.');
            if (!isExceptionFromDeepReduce(change[key])) {
                if (isObject(change[key])) {
                    if ('_arrayOperation' in change[key] || Array.isArray(change[key])) {
                        let newArray = stateServiceInstance.get(path.slice(prependedCount) as any);
                        localStorage.setItem(pathString, JSON.stringify({ v: newArray, t: 'array' }));
                        if (!this.localStorageKeys.has(pathString)) this.localStorageKeys.add(pathString);
                    } else {
                        if ('_reducerMode' in change[key] && change[key]._reducerMode === 'replace') {
                            this.unset(pathString);
                            delete change[key]._reducerMode;
                        }
                        const newPart = { ...change[key] };
                        this.setRecursive(newPart, fullPath, stateServiceInstance, prependedCount);
                    }
                } else {
                    if (change[key] === null || change[key] === undefined) {
                        this.unset(pathString);
                    } else {
                        localStorage.setItem(pathString, JSON.stringify({ v: change[key], t: typeof change[key] }));
                        if (!this.localStorageKeys.has(pathString)) this.localStorageKeys.add(pathString);
                    }
                }
            } else  {
                this.unset(pathString);
            }
        }
    }

    private unset(path: string) {
        for (let localStorageKey of this.localStorageKeys.values()) {
            if (localStorageKey.startsWith(path)) {
                localStorage.removeItem(localStorageKey);
                this.localStorageKeys.delete(localStorageKey);
            }
        }
    }

    private getFullPrefix(stateServiceInstance?: LitElementStateService<State>): string {
        return `${LOCALSTORAGE_PREFIX}.${ stateServiceInstance.config?.cache?.name ? `${stateServiceInstance.config?.cache?.name}.` : '' }`;
    }
}

export { LocalStorageCacheHandler };
