import { SET_REQUEST_STATUS } from "../types/actionTypes";
import { RequestStatusState } from "../types/stateTypes";
import { RequestStatusAction } from "../types/storeActionsTypes";
function requestStatusReducer(
    state: RequestStatusState = {},
    action: RequestStatusAction
) {
    const { type } = action;
    if (type === SET_REQUEST_STATUS) {
        return {
            ...state,
            [action.entityName]: {
                status: action.status,
                actionType: action.actionType,
                data: action.data ?? {},
            },
        };
    }
    return state;
}

export default requestStatusReducer;
