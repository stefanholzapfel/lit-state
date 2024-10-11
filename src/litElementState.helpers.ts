import {LitElementStateService, SubscribeStateFromElementOptions} from './index';

export const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Map) && !(item instanceof Set));
}

export const deepCopy = (obj) => {
    let copy;

    // Handle the 3 simple types, null, undefined and Promises
    if (null == obj || 'object' !== typeof obj || isExceptionFromDeepReduce(obj)) {
        return obj;
    }

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0,
                 len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Map
    if (obj instanceof Map) {
        const copy = new Map();
        obj.forEach((value, key) => {
            copy.set(key, deepCopy(value));
        });
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (const attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = deepCopy(obj[attr]);
            }
        }
        return copy;
    }

    throw new Error('Unable to copy obj! Its type isn\'t supported.');
}

export const deepCompare = (one, two): boolean => {
    if (one === null || typeof one !== 'object' || isExceptionFromDeepReduce(one)) {
        return one === two;
    }

    // Handle Date
    if (one instanceof Date) {
        return two instanceof Date && one.getDate() === two.getDate();
    }

    // Handle Array
    if (one instanceof Array) {
        if (!(two instanceof Array) || two.length !== one.length) return false;
        for (const [index, entry] of one.entries()) {
            if (!deepCompare(entry, two[index])) return false;
        }
        return true;
    }

    // Handle Map
    if (one instanceof Map) {
        if (!(two instanceof Map) || Array.from(two).length !== Array.from(one).length) return false;
        one.forEach((value, key) => {
            if (!deepCompare(value, two.get(key))) return false;
        });
        return true;
    }

    // Handle Object
    if (one instanceof Object) {
        if (!(two instanceof Object) || Object.keys(two).length !== Object.keys(one).length) return false;
        for (const attr in one) {
            if (!deepCompare(one[attr], two[attr])) return false;
        }
        return true;
    }
}

export const subscribeOptionsFromDefaultOrParams = (options: SubscribeStateFromElementOptions, service: LitElementStateService<any>): SubscribeStateFromElementOptions => {
    return {
        ...service.config.defaultSubscribeOptions,
        ...options ?? {}
    }
}

// Checks if an object shouldn't be deep reduced but rather replaced. These types are also excluded from caching and deepCompare
export const isExceptionFromDeepReduce: (obj: any) => boolean = (obj) => {
    return (
        obj instanceof Promise ||
        obj instanceof AbortController ||
        obj instanceof File ||
        obj instanceof Blob ||
        obj instanceof Element ||
        obj instanceof Date
    );
}
