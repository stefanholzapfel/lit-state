import {CacheHandler, LitElementStateService} from '../index';
import {isExceptionFromDeepReduce, isObject} from '../litElementState.helpers';

const LOCALSTORAGE_PREFIX = 'lit-state';

class LocalStorageCacheHandler implements CacheHandler {
    name = 'localstorage';
    private localStorageKeys = new Set<string>();

    constructor() {
        for (let localStorageKey of this.localStorageKeys.values()) {
            if (localStorageKey.startsWith(this.getPathString([]))) {
                this.localStorageKeys.add(localStorageKey);
            }
        }
    }

    load(stateServiceInstance: LitElementStateService<any>): any {
        const res = {};
        this.localStorageKeys.forEach(key => {
            if (key.startsWith(this.getPathString([], stateServiceInstance))) {
                const entry = JSON.parse(localStorage.getItem(key));
                switch (entry.t) {
                    case 'boolean':
                        return entry.val === 'true';
                    case 'number':
                        return +entry.val;
                    case 'string':
                    case 'array':
                        return entry.val;
                }
            }
        });
        return res;
    }

    set(path: string[], value: any, stateServiceInstance: LitElementStateService<any>) {
        const _path = [...path];
        if (typeof value === 'object') {
            // When an object is set, it replaces all other values under this path
            this.unset(_path, stateServiceInstance);
        }
        this.deepSet(this.getPathString(_path, stateServiceInstance), value);
    }

    unset(path: string[], stateServiceInstance: LitElementStateService<any>) {
        const pathString = this.getPathString(path, stateServiceInstance);
        for (let localStorageKey of this.localStorageKeys.values()) {
            if (localStorageKey.startsWith(pathString)) {
                localStorage.removeItem(localStorageKey);
                this.localStorageKeys.delete(localStorageKey);
            }
        }
    }

    private deepSet(path: string, value: any) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
            this.localStorageKeys.add(path);
            localStorage.setItem(path, JSON.stringify({ v: value, t: Array.isArray(value) ? 'array' : typeof value }));
        } else if (isObject(value)) {
            if (!isExceptionFromDeepReduce(value)) {
                for (const key in value) {
                    this.deepSet(`${path}.${key}`, value[key]);
                }
            }
        }
    }

    private getPathString(path: string[], stateServiceInstance?: LitElementStateService<any>) {
        if (stateServiceInstance?.config?.cache?.name) { path.unshift(stateServiceInstance.config?.cache?.name) }
        path.unshift(LOCALSTORAGE_PREFIX);
        return path.join('.');
    }
}

export { LocalStorageCacheHandler };
