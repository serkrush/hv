import { AnyAction, CombinedState, Reducer, combineReducers } from "redux";
import { HYDRATE } from "next-redux-wrapper";
import baseReducer from "./baseReducer";
import { BaseEntity } from "src/entities/BaseEntity";
import { pagination } from "./paginationReducer";
import authReducer from "./authReducer";
import flagger from "./flagger";
import requestStatusReducer from "./requestStatusReducer";
import hashReducer from "./hashReducer";

let combinedReducers = Reflect.getMetadata("reducers", BaseEntity).reduce(
    (reducers, obj) => {
        const key = `${obj.reducerName}`;
        const reducer = baseReducer(obj.reducerName);
        return {
            ...reducers,
            [key]: reducer,
        };
    },
    {
        flagger,
        pagination,
        auth: authReducer,
        hashes: hashReducer,
        requestStatus: requestStatusReducer,
    }
);

const rootReducer = combineReducers(combinedReducers) as Reducer<
    CombinedState<any>,
    AnyAction
>;

export default (state, action) => {
    if (action.type === HYDRATE) {
        let nextState = {
            ...state,
        };

        const hydratedState = action.payload;

        Object.keys(state).forEach((reducer) => {
            if (hydratedState[reducer]) {
                let newValues: any = {};
                const newData = hydratedState[reducer];
                newValues = [state[reducer] ?? {}, newData ?? {}].reduce(
                    (r, o) => {
                        Object.keys(o).forEach((k) => (r[k] = o[k]));
                        return r;
                    },
                    {}
                );

                if (
                    reducer != "auth" ||
                    !(
                        state.auth &&
                        state.auth.identity &&
                        state.auth.identity.userId &&
                        state.auth.identity.userId != "guest"
                    )
                ) {
                    nextState[reducer] = {
                        ...nextState[reducer],
                        ...newValues,
                    };
                }
            }
        });
        return { ...state, ...nextState };
    } else {
        return rootReducer(state, action);
    }
};
