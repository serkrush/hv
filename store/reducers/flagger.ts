import { SET_FLAGGER, DELETE_FLAGGERS } from "../types/actionTypes";
import { BaseStoreState } from "../types/stateTypes";
import { BoxAction } from "../types/storeActionsTypes";

function flagger(state: BaseStoreState = {}, action: BoxAction) {
    const { type } = action;
    if (type === SET_FLAGGER) {
        return {
            ...state,
            [action.key]: action.value,
        };
    }
    if (type === DELETE_FLAGGERS) {
        return {};
    }
    return state;
}

export default flagger;
