export const isEmpty = (value: string) => {
    return !value || value == "" || value.length == 0 || value?.trim() == ""
}

export function isFunction(obj: any) {
    return typeof obj === 'function';
}