import * as actionTypes from "../types/actionTypes";
import { AuthState } from "../types/stateTypes";
import { GUEST_IDENTITY } from "@/src/constants";
import { AuthAction } from "../types/storeActionsTypes";
import { GRANT, ROLE } from "@/acl/types";

const initialState: AuthState = {
    identity: GUEST_IDENTITY,
    roles: {
        [ROLE.GUEST]: {
            display: 'guest',
            url: '',
        },
    },
    rules: {
        '/': {
            allow: {
                [ROLE.GUEST]: [GRANT.READ, GRANT.GET],
            },
        },
        '/invitation/*': {
            allow: {
                [ROLE.GUEST]: [GRANT.READ, GRANT.GET],
            },
        }
    },
};

const authReducer = (
    state: AuthState = initialState,
    action: AuthAction
): AuthState => {
    switch (action.type) {
        case actionTypes.UPDATE_AUTH: {
            return {
                ...action.value,
            };
        }
        case actionTypes.RESET_AUTH: {
            return {
                ...initialState,
            };
        }
    }

    return state;
};

export default authReducer;
