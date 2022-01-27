import {CacheHandler, LitElementStateService, StateChange} from '../index';
import {isExceptionFromDeepReduce, isObject} from '../litElementState.helpers';
import {DeepPartial} from 'ts-essentials';

const LOCALSTORAGE_PREFIX = 'lit-state';

class LocalStorageCacheHandler<State> implements CacheHandler<State> {
    // TODO: ensure that this works with array feature
    name = 'localstorage';
    private localStorageKeys = new Set<string>();

    load(stateServiceInstance: LitElementStateService<State>): StateChange<State> | DeepPartial<StateChange<State>> {
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

    set(change: StateChange<State> | DeepPartial<StateChange<State>>, stateServiceInstance: LitElementStateService<State>) {
        const path = [ LOCALSTORAGE_PREFIX ];
        if (!!stateServiceInstance?.config?.cache?.name) {
            path.push(stateServiceInstance.config.cache.name);
        }
        this.setRecursive(change, path);
    }

    private setRecursive(change: StateChange<State> | DeepPartial<StateChange<State>>, path: string[]) {
        for (const key in change as any) {
            const fullPath = [ ...path, key ];
            const pathString = fullPath.join('.');
            if (!isExceptionFromDeepReduce(change[key])) {
                if (isObject(change[key]) && !Array.isArray(change[key])) {
                    if ('_reducerMode' in change[key] && change[key]._reducerMode === 'replace') {
                        this.unset(pathString);
                    }
                    const newPart = { ...change[key] };
                    delete newPart._reducerMode;
                    this.setRecursive(newPart, fullPath);
                } else {
                    if (change[key] === null || change[key] === undefined) {
                        this.unset(pathString);
                    } else {
                        localStorage.setItem(pathString, JSON.stringify({ v: change[key], t: Array.isArray(change[key]) ? 'array' : typeof change[key] }));
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
