import { Action } from "redux";
import { AuthState } from "./stateTypes";
import { RequestStatusAction } from "./storeActionsTypes";
import { IHashData } from "../reducers/hashReducer";

export function action(type: string, payload = {}): Action {
    return { type, ...payload };
}

export function pageFetching(pageName, page, isFetching, force = false) {
    return action(PAGE_FETCHING, { pageName, page, isFetching, force });
}

export function pageSetFilter(pageName, filter, sort) {
    return action(PAGE_SET_FILTER, { pageName, filter, sort });
}

export const pageSelectItem = (pageName: string, selectedItems: string[]) => action(PAGE_SELECT_ITEM, { pageName, selectedItems });

export function pageClear(pageName) {
    return action(PAGE_CLEAR, { pageName });
}

export function allPageClear() {
    return action(PAGE_CLEAR_ALL, {});
}

export function clearModel(entities: string | string[]) {
    return action(MODEL_CLEAR, { payload: { entities } });
}

export function clearAllModel() {
    return action(MODEL_CLEAR, { payload: { entities: [] } });
}

export const saveToHash = (data: IHashData) => {
    return action(SAVE_TO_HASH, data);
};

export const clearOutOfDate = (outOfDateHashTime: number) => {
    return action(CLEAR_OUT_OF_DATE, { outOfDateHashTime });
};

export const SAVE_TO_HASH = 'SAVE_TO_HASH';
export const CLEAR_OUT_OF_DATE = 'CLEAR_OUT_OF_DATE';

export const PAGE_FETCHING = "PAGE_FETCHING";
export const PAGE_SET_FILTER = "PAGE_SET_FILTER";
export const PAGE_CLEAR = "PAGE_CLEAR";
export const PAGE_CLEAR_ALL = "PAGE_CLEAR_ALL";
export const PAGE_SELECT_ITEM       = 'PAGE_SELECT_ITEM';


export const ERROR = "ERROR";

export const ADD = "ADD";
export const UPDATE = "UPDATE";
export const GET = "GET";
export const DELETE = "DELETE";

export const UPDATE_VALUE = "UPDATE_VALUE";

export const UPDATE_AUTH = "UPDATE_AUTH";

export const RESET_AUTH = "RESET_AUTH";

export const SET_FLAGGER = "SET_FLAGGER";
export const DELETE_FLAGGERS = "DELETE_FLAGGERS";

export const DELETE_ALL = "DELETE_ALL";
export const MODEL_CLEAR = "MODEL_CLEAR";

export const SET_REQUEST_STATUS = "SET_REQUEST_STATUS";

export const setFlagger = (key: string, value: any) =>
    action(SET_FLAGGER, { key, value });

export const clearFlagger = (key: string) =>
    action(SET_FLAGGER, { key, undefined });

export const deleteFlaggers = () => action(DELETE_FLAGGERS, {});

export const setRequestStatus = (data: Omit<RequestStatusAction, "type">) =>
    action(SET_REQUEST_STATUS, data);

export const updateAuth = (data: AuthState) => {
    return action(UPDATE_AUTH, { value: data });
};

export const resetAuth = () => {
    return action(RESET_AUTH);
};
