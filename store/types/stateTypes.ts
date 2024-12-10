import { IIdentity, IRoles, IRules } from "@/acl/types";
import { RequestStatus } from "@/src/constants";

export type BaseStoreState = {};

export type AuthState = {
    rules?: IRules;
    roles?: IRoles;
    identity: IIdentity;
};

export type RequestStatusState = {
    [key: string]: {
        status: RequestStatus;
        actionType: string,
        data?: any;
    };
};
