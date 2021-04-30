import {CacheHandler} from './index';
import {isExceptionFromDeepReduce, isObject} from './litElementState.helpers';

class LocalStorageCacheHandler implements CacheHandler {
    private localStorageKeys = new Set<string>();

    load(path: string[]): any {
    }

    set(path: string[], value: any) {
        if (typeof value === 'object') {
            // When an object is set, it replaces all other values under this path
            this.unset(path);
        }
        const stringPath = path.join('.')
        this.deepSet(stringPath, value);
    }

    unset(path: string[]) {
        const stringPath = path.join('.');
        for (let localStorageKey of this.localStorageKeys.values()) {
            if (localStorageKey.startsWith(stringPath)) {
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
}

export { LocalStorageCacheHandler };
