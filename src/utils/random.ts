function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export const random = (array: any[]) => {
    if (array.length == 0) {
        return null;
    }

    if (array.length == 1) {
        return array[0];
    }

    return array[getRandomInt(array.length)];
};

export function isEmpty(obj: Record<any, any>) {
    if (!obj) {
        console.error('isEmpty should get object as parameter, not:', obj);
        return true;
    }
    return !Object.keys(obj).length;
}
export function isFunction(obj: any) {
    return typeof obj === 'function';
}
export function isObject(obj: any) {
    const isNotArray = !Array.isArray(obj);
    return typeof obj === 'object' && isNotArray;
}
export const hasOwnProperty = (obj: any, property: string) => {
    return Object.prototype.hasOwnProperty.call(obj, property);
};

export function clickOutSideTheBlock(event: any, elementId: string) {
    return document.getElementById(elementId)?.contains(event.target);
}


export const isNumber = value => value && isNaN(Number(value)) ? 'Must be a number' : undefined;