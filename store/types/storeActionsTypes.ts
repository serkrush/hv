import { RequestStatus } from "@/src/constants";
import { AuthState } from "./stateTypes";

export type StoreAction = {
    type: string;
    payload: any;
    entityReducer?: string;
};

export type DispatchType = (args: StoreAction) => StoreAction;

export type BoxAction = {
    type: string;
    key: string;
    value: any;
};

export type AuthAction = {
    type: string;
    value?: AuthState;
};

export type RequestStatusAction = {
    type: string;
    entityName: string;
    actionType: string,
    status: RequestStatus;
    data?: any;
};
