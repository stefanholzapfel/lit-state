import {CacheHandler, LitElementStateService, ReducableState} from '../index';
import {isExceptionFromDeepReduce, isObject} from '../litElementState.helpers';
import {DeepPartial} from 'ts-essentials';

const LOCALSTORAGE_PREFIX = 'lit-state';

class LocalStorageCacheHandler<State> implements CacheHandler<State> {
    name = 'localstorage';
    private localStorageKeys = new Set<string>();

    load(stateServiceInstance: LitElementStateService<State>): ReducableState<State> | DeepPartial<State> {
        const res = {} as DeepPartial<State>;
        const fullPrefix = this.getFullPrefix(stateServiceInstance);
        for (const key in localStorage) {
            if (key.startsWith(fullPrefix)) {
                this.localStorageKeys.add(key);
                const path = key.substring(fullPrefix.length).split('.');
                const entry = JSON.parse(localStorage.getItem(key));
                switch (entry.t) {
                    case 'boolean':
                        this.setValue(res, path, entry.v === 'true');
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
        return res;
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

    set(change: ReducableState<State> | DeepPartial<ReducableState<State>>, stateServiceInstance: LitElementStateService<State>) {
        const path = [ LOCALSTORAGE_PREFIX ];
        if (!!stateServiceInstance?.config?.cache?.name) {
            path.push(stateServiceInstance.config.cache.name);
        }
        this.setRecursive(change, path);
    }

    private setRecursive(change: ReducableState<State> | DeepPartial<ReducableState<State>>, path: string[]) {
        for (const key in change) {
            if (!isExceptionFromDeepReduce(change[key])) {
                if (isObject(change[key]) && !Array.isArray(change[key])) {
                    if ('_reducerMode' in change[key] && change[key]._reducerMode === 'replace') {
                        this.unset([ ...path, key ]);
                    }
                    delete change[key]._reducerMode;
                    this.setRecursive(change[key], [ ...path, key ]);
                } else {
                    if (change[key] === null || change[key] === undefined) {
                        this.unset([ ...path, key ]);
                    } else {
                        localStorage.setItem([ ...path, key ].join('.'), JSON.stringify({ v: change[key], t: Array.isArray(change[key]) ? 'array' : typeof change[key] }));
                    }
                }
            } else  {
                this.unset([ ...path, key ]);
            }
        }
    }

    private unset(path: string[]) {
        for (let localStorageKey of this.localStorageKeys.values()) {
            if (localStorageKey.startsWith(path.join('.'))) {
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
