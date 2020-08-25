import { LitElementStateService, SubscribeStateFromElementOptions } from './index';

export const isObject = (item) =>  {
    return (item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Map) && !(item instanceof Set));
}

export const deepCopy = (obj) =>  {
    let copy;

    // Handle the 3 simple types, null, undefined and Promises
    if (null == obj || 'object' !== typeof obj || obj instanceof Promise) {
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
        obj.forEach((value, key, map) => {
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

export const optionsFromDefaultOrParams = (params: any[], service: LitElementStateService<any>): SubscribeStateFromElementOptions => {
    let options = service.defaultSubscribeFromElementOptions;
    if (
        params[params.length - 1].hasOwnProperty('getInitialValue') ||
        params[params.length - 1].hasOwnProperty('pushNestedChanges') ||
        params[params.length - 1].hasOwnProperty('getDeepCopy') ||
        params[params.length - 1].hasOwnProperty('autoUnsubscribe')
    ) {
        options = {
            ...options,
            ...params.pop() as SubscribeStateFromElementOptions
        }
    }
    return options;
}
