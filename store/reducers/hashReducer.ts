/* eslint-disable indent */
import * as actionTypes from '../types/actionTypes';

export interface IHashState {
    [key: string]: number;
}

export interface IHashData {
    hash: string;
    dateUTC: number;
}

interface IHashAction extends IHashData {
    type: string;
    outOfDateHashTime?: number;
}

const hashReducer = (
    state: IHashState = {},
    action: IHashAction,
): IHashState => {
    switch (action.type) {
        case actionTypes.SAVE_TO_HASH:
            return {
                ...state,
                [action.hash]: action.dateUTC,
            };
        case actionTypes.CLEAR_OUT_OF_DATE:
            return Object.entries(state).reduce((acc, [key, dateUTC]) => {
                if (
                    dateUTC + (action.outOfDateHashTime ?? 60 * 1000) <
                    Date.now()
                ) {
                    return acc;
                }
                return { ...acc, [key]: dateUTC };
            }, {}) ?? {};
    }
    return state;
};

export default hashReducer;
