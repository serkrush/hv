import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import { AnyAction, applyMiddleware, compose, Dispatch } from "redux";
import createSagaMiddleware, { Task } from "redux-saga";
import { all } from "redux-saga/effects";
import BaseController from "server/controllers/BaseController";
import BaseClientContext from "src/di/baseClientContext";
import { BaseEntity } from "src/entities/BaseEntity";
import rootReducer from "./reducers";
// import ImmutableStateInvariantMiddleware from 'redux-immutable-state-invariant';

import { AppState, ENTITY } from "@/src/constants";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    PURGE,
    REGISTER,
    REHYDRATE
} from "redux-persist";
import { PersistConfig, Persistor } from "redux-persist/es/types";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";

const persistConfig: PersistConfig<AppState> = {
    key: "root",
    storage: storage,
    stateReconciler: autoMergeLevel2,
    whitelist: [ENTITY.IDENTITY, "flagger", "auth"],
    blacklist: ["pagination"],
};

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

export interface SagaStore extends EnhancedStore<any, AnyAction> {
    sagaTask?: Task;
}

export default class ReduxStore extends BaseClientContext {
    private _store: EnhancedStore<any, AnyAction>;
    public _wrapper;
    private _persistor: Persistor;

    public setStore(value) {
        this._store = value;
    }

    public setPersistor(value) {
        this._persistor = value;
    }

    public store(): EnhancedStore<any, AnyAction> {
        return this._store;
    }

    public get state() : AppState {
        return this._store.getState();
    };

    public get persistor(): Persistor {
        return this._persistor;
    }

    public dispatch = (args: any): Dispatch => {
        return this._store.dispatch(args);
    };

    constructor(opts: any) {
        super(opts);

        const store = this.configureDevStore();
        this._store = store;
    }

    public rootSaga = function* () {
        const sagas = BaseEntity.sagas();
        yield all(sagas);
    };

    private configureDevStore(initialState?: any) {
        const makeStore = () => {
            const middleware: any = [];
            const enhancers: any = [];

            const sagaMiddleware = createSagaMiddleware();
            middleware.push(sagaMiddleware);
            // middleware.push(ImmutableStateInvariantMiddleware());

            const composeEnhancers =
                (typeof window == "object" &&
                    window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"]) ||
                compose;

            enhancers.push(applyMiddleware(...middleware));
            const enhancer = composeEnhancers(...enhancers);

            const store: EnhancedStore<any, AnyAction> = configureStore({
                reducer: persistReducer(persistConfig, rootReducer),
                preloadedState: initialState,
                middleware: (getDefaultMiddleware) =>
                    getDefaultMiddleware({
                        serializableCheck: {
                            ignoredActions: [
                                FLUSH,
                                REHYDRATE,
                                PAUSE,
                                PERSIST,
                                PURGE,
                                REGISTER,
                            ],
                            ignoredActionPaths: [
                                "router.back",
                                "router.push",
                                "router.forward",
                                "router.prefetch",
                                "router.refresh",
                                "router.replace",
                            ],
                        },
                    }).concat(sagaMiddleware),
                //TODO add enhancers
                // enhancers: enhancer
            });

            (store as SagaStore).sagaTask = sagaMiddleware.run(this.rootSaga);
            return store;
        };

        this._wrapper = createWrapper<EnhancedStore<any, AnyAction>>(
            makeStore,
            {
                debug: false,
            }
        );
        return this._wrapper;
    }

    public getServerSideProps(
        container,
        route: string,
        controllerName: string | string[]
    ) {
        return this._wrapper.getServerSideProps((store) => async (context) => {
            const items = Array.isArray(controllerName)
                ? controllerName
                : [controllerName];
            let response = {};
            let actions: any[] = [];
            for (let i = 0; i < items.length; i++) {
                const controller = container.resolve(
                    items[i]
                ) as BaseController;
                const res = await (
                    controller.handler(route) as (context: any) => Promise<any>
                )(context);
                response = {
                    ...response,
                    ...res?.props?.data,
                };
                if(res?.props?.error || res.props?.data?.error) {
                    if(res?.props?.error?.code || res?.props?.error?.message){
                        return {
                            redirect: {
                                destination: `/error/${res?.props?.error?.code ?? 500}?message=${encodeURIComponent(res?.props?.error?.message ?? 'ERROR')}`,
                                permanent: false
                            },
                        }
                    }
                    if(res.props?.data?.error?.code || res?.props?.data?.error?.message) {
                        return {
                            redirect: {
                                destination: `/error/${res?.props?.data?.error?.code ?? 500}?message=${encodeURIComponent(res?.props?.data?.error?.message ?? 'ERROR')}`,
                                permanent: false
                            },
                        }
                    }
                    else if (context.query['errorResponse']) {
                        return {
                            redirect: {
                                destination: `/error/${context.query['errorResponse'].statusCode ?? 500}?message=${encodeURIComponent(context.query['errorResponse'].message ?? 'ERROR')}`,
                                permanent: false
                            },
                        }
                    }
                    else {
                        return {
                            redirect: {
                                destination: `/error/500`,
                                permanent: false
                            },
                        }
                    }
                }
                actions.push(controller.normalizedAction(res.props.data));
            }
            actions.forEach((action) => {
                store.dispatch(action);
            });
            return { props: { data: response } };
        });
    }
}