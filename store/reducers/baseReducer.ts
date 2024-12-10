import * as actionTypes from "../types/actionTypes";
import { BaseStoreState } from "../types/stateTypes";
import { StoreAction } from "../types/storeActionsTypes";

const baseReducer =
    (entityReducer: string) =>
    (state: BaseStoreState = {}, action: StoreAction): BaseStoreState => {
        switch (action.type) {
            case actionTypes.GET:
            case actionTypes.ADD:
            case actionTypes.UPDATE:
                if (action.payload) {
                    const entitiesArr = action.payload.data.entities;
                    let newValues: any = {};
                    if (entitiesArr && entityReducer in entitiesArr) {
                        const newData = entitiesArr[entityReducer];
                        newValues = [
                            state[entityReducer] ?? {},
                            newData ?? {},
                        ].reduce(function (r, o) {
                            Object.keys(o).forEach(function (k) {
                                r[k] = o[k];
                            });
                            return r;
                        }, {});
                    }

                    return {
                        ...state,
                        ...newValues,
                    };
                }
                break;
            case actionTypes.DELETE:
                if (action.payload) {
                    const entitiesArr = action.payload.data.entities;
                    if (entitiesArr && entityReducer in entitiesArr) {
                        const dataForDelete = entitiesArr[entityReducer];
                        const oldValues = state ?? {};
                        let newValues = {};
                        Object.keys(oldValues).forEach((key) => {
                            if (!dataForDelete.hasOwnProperty(key)) {
                                newValues[key] = oldValues[key];
                            }
                        });

                        return {
                            ...newValues,
                        };
                    }
                }

                break;
            case actionTypes.DELETE_ALL:
                if (action.payload) {
                    const entitiesArr = action.payload.data.entities;
                    if (entitiesArr && entityReducer in entitiesArr) {
                        return {};
                    }
                }
                break;
            case actionTypes.MODEL_CLEAR:
                if (action.payload) {
                    const entities = action.payload.entities;
                    const entitiesArr = Array.isArray(entities)
                        ? entities
                        : [entities];
                    if (
                        entitiesArr &&
                        (entitiesArr.length == 0 ||
                            entityReducer in entitiesArr)
                    ) {
                        return {};
                    }
                }
                break;
        }
        return state;
    };

export default baseReducer;
