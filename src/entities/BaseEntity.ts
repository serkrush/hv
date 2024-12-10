import getConfig from 'next/config';
import has from 'lodash/has';
import get from 'lodash/get';

import {Schema, normalize, schema} from 'normalizr';
import {put, call, take, fork, select} from 'redux-saga/effects';
import BaseClientContext from 'src/di/baseClientContext';
import * as actionTypes from '@/store/types/actionTypes';
import IClientContextContainer from 'src/di/interfaces/container';
import clientContainer from 'src/di/clientContainer';
import {IPagerParams} from 'src/pagination/IPagerParams';
import {
    AppState,
    RequestStatus,
    ResponseCode,
    TPaginationInfo,
} from '../constants';
import {Action} from 'redux';
import md5 from 'md5';

const {
    publicRuntimeConfig: {BASE_URL, API_STRING, OUT_OF_DATE_HASH_TIME},
} = getConfig();

export enum HTTP_METHOD {
    GET,
    POST,
}

type ActionParam<T> = T extends (arg?: infer P) => any
    ? (data?: P) => Action<any>
    : T extends (arg: infer P) => any
    ? (data: P) => Action<any>
    : () => Action<any>;

export class BaseEntity<EntityInstance = null> extends BaseClientContext {
    //public static _actions = [];
    private _schema: any;
    private _entityName: any;

    protected get entityName() {
        return this._entityName;
    }

    constructor(opts: IClientContextContainer) {
        super(opts);
        this.actions = {} as {
            [methodName in keyof Omit<
                EntityInstance,
                keyof BaseEntity<EntityInstance> | 'actions'
            >]: ActionParam<EntityInstance[methodName]>;
        };

        this.pageEntity = this.pageEntity.bind(this);
        this.actionRequest = this.actionRequest.bind(this);
        this.normalizedData = this.normalizedData.bind(this);
        this.normalizedAction = this.normalizedAction.bind(this);

    }

    //public actions: { [K in Exclude<keyof this, keyof BaseEntity>]?: string };
    public actions: {
        [methodName in keyof Omit<
            EntityInstance,
            keyof BaseEntity<EntityInstance> | 'actions'
        >]: ActionParam<EntityInstance[methodName]>;
    };

    protected initSchema(
        key: string | symbol,
        definition?: Schema,
        options?: any,
    ) {
        this._entityName = key;
        this._schema = new schema.Entity(key, definition, options);
    }

    protected xFetch(
        endpoint: string,
        method: HTTP_METHOD,
        data = {},
        token?: string,
    ) {
        let fullUrl = `${BASE_URL}${API_STRING}${endpoint}`;

        const headers: any = {
            'Access-Control-Allow-Origin': '*',
        };
        if (token != undefined && token != null) {
            headers['Authorization'] = 'bearer ' + token;
        }

        let methodString = 'GET';
        switch (method) {
        case HTTP_METHOD.GET:
            methodString = 'GET';
            break;
        case HTTP_METHOD.POST:
            methodString = 'POST';
            break;
        }

        const controller = new AbortController();
        const params: any = {
            method: methodString,
            //credentials: "same-origin",
            headers,
            signal: controller.signal,
        };

        if (method !== HTTP_METHOD.GET) {
            params.headers['content-type'] = 'application/json';
            params.body = JSON.stringify(data);
        } else {
            const opts = Object.entries(data)
                .map(([key, val]) => `${key}=${val}`)
                .join('&');
            fullUrl += opts.length > 0 ? `?${opts}` : '';
        }

        const timeoutId = setTimeout(() => {
            console.log('Request rejected due to the timeout');
            controller.abort();
        }, 10000);
        return fetch(fullUrl, params)
            .then(response => {
                clearTimeout(timeoutId);
                return response.json().then(json => ({json, response}));
            })
            .then(({json, response}) =>
                Promise.resolve({
                    success: !!response.ok,
                    response: json,
                }),
            )
            .catch(e => {
                controller.abort();
                console.error('request exception', fullUrl, e);
                clearTimeout(timeoutId);
                return Promise.resolve({
                    success: false,
                    response: {},
                });
            });
    }

    public xSave = (
        uri: string,
        data: any = {},
        forceHashing: boolean = true,
    ) => {
        return this.actionRequest(
            uri,
            HTTP_METHOD.POST,
            actionTypes.ADD,
            data,
            forceHashing,
        );
    };

    public xRead = (
        uri: string,
        data: any = {},
        method: HTTP_METHOD = HTTP_METHOD.GET,
        forceHashing: boolean = false,
    ) => {
        return this.actionRequest(
            uri,
            method,
            actionTypes.GET,
            data,
            forceHashing,
        );
    };

    public xDelete = (
        uri: string,
        data: any = {},
        forceHashing: boolean = true,
    ) => {
        return this.actionRequest(
            uri,
            HTTP_METHOD.POST,
            actionTypes.DELETE,
            data,
            forceHashing,
        );
    };

    private *actionRequest(
        url: any,
        HTTP_METHOD: any,
        type: any,
        data: any,
        forceHashing: boolean,
    ) {
        try {
            delete data.type;
            delete data.force;
            const {redux} = this.di;
            let token = undefined;
            if (
                redux &&
                redux.state &&
                redux.state['auth'] &&
                redux.state['auth']['identity'] &&
                redux.state['auth']['identity']['token']
            ) {
                token = redux.state['auth']['identity']['token'];
            }
            if (!this.isHashExist(url, data) || forceHashing) {
                yield put(
                    actionTypes.setRequestStatus({
                        entityName: this._entityName,
                        actionType: type,
                        status: RequestStatus.LOADING,
                        data,
                    }),
                );
                const sdata: any = yield call(
                    this.xFetch,
                    url,
                    HTTP_METHOD,
                    data,
                    token,
                );
                if (sdata.response.code == ResponseCode.TOAST) {
                    const {ToastEmitter} = this.di;
                    if (sdata.response.isSuccess) {
                        ToastEmitter.message(sdata.response.message);
                    } else {
                        ToastEmitter.errorMessage(sdata.response.message);
                    }
                }
                if (sdata.response.isSuccess) {
                    this.saveDataToHash(url, data);
                }
                yield put(this.normalizedAction(sdata.response, type));
                yield put(
                    actionTypes.setRequestStatus({
                        entityName: this._entityName,
                        status: RequestStatus.SUCCESS,
                        actionType: type,
                        data: sdata,
                    }),
                );
                return sdata;
            } else {
                return {};
            }
        } catch (error) {
            yield put({type: actionTypes.ERROR, error});
            yield put(
                actionTypes.setRequestStatus({
                    entityName: this._entityName,
                    status: RequestStatus.ERROR,
                    actionType: type,
                    data: error,
                }),
            );
            return null;
        }
    }

    public normalizedData(data: any) {
        let schema = Array.isArray(data) ? [this._schema] : this._schema;
        let resultData = null;
        if (data && schema) {
            resultData = normalize(data, schema);
        }
        return resultData?.result ? resultData : {};
    }

    public normalizedAction(
        response: {data: any; pager: any; error?: any},
        type = actionTypes.ADD,
    ) {
        try {
            if (response.error) {
                return {type: actionTypes.ERROR, error: response.error};
            } else {
                return {
                    type: type,
                    payload: {
                        data: this.normalizedData(response.data),
                        pager: response.pager,
                    },
                    entityReducer: this._entityName,
                };
            }
        } catch (error) {
            return {type: actionTypes.ERROR, error};
        }
    }

    public static sagas() {
        const objects = Reflect.getMetadata('sagas', BaseEntity);
        const maped = objects.map(
            (obj: {className: string; methodName: string}) => {
                const actionName = obj.className + '_' + obj.methodName;
                const classInstance = clientContainer.resolve(obj.className);
                const method =
                    classInstance[obj.methodName].bind(classInstance);
                classInstance.actions[obj.methodName] = (data?: any) =>
                    actionTypes.action(actionName, data);
                const saga = function* () {
                    while (true) {
                        const payload = yield take(actionName);
                        const data = {...payload};
                        yield call(method, data);
                    }
                };
                return fork(saga);
            },
        );
        return maped;
    }

    public *pageEntity(uri: string, params: IPagerParams) {
        const pageName = params.pageName ?? '';
        const pagination: TPaginationInfo = yield select(
            (state: AppState) => state.pagination ?? {},
        );
        if (pagination[pageName]['fetching']) {
            return;
        }
        if (!('page' in params)) {
            params['page'] = pagination[pageName]['currentPage'];
        }
        let count = 0;
        if (
            !params.force &&
            pagination[pageName] &&
            pagination[pageName]['count']
        ) {
            count = pagination[pageName]['count'];
        }

        // set filter to paginator, in case fetch from getInitProps()
        const pFilter = params.filter ? params.filter : {};
        const pSort = params.sort ? params.sort : {};
        yield put(actionTypes.pageSetFilter(pageName, pFilter, pSort));
        const pagerData = {
            ...params,
            pageName,
            count,
            entityName: this._entityName,
        };

        const forceHashing = !this.isHashExist(uri, pagerData)
        if (
            !pagination[pageName] ||
            !pagination[pageName]['pages'][params.page ?? 0] ||
            params?.force || forceHashing
        ) {
            if (params.force) {
                yield put(actionTypes.pageClear(pageName));
            }
            yield call(
                this.xRead,
                uri,
                pagerData,
                HTTP_METHOD.POST,
                params.force || forceHashing,
            );
        }
    }

    public static getPagerItems(pagerName: string): any[] {
        const {state} = clientContainer.resolve('redux');
        const pager = state['pagination'];
        if (has(pager, pagerName)) {
            const entityName = get(pager, [pagerName, 'entityName']);
            if (has(state, entityName)) {
                const pageNumber = get(pager, [pagerName, 'currentPage']);
                if (get(pager, [pagerName, 'pages', pageNumber, 'ids'])) {
                    const items = state[entityName];
                    const ids = get(pager, [
                        pagerName,
                        'pages',
                        pageNumber,
                        'ids',
                    ]);
                    return ids.map((id: any) => {
                        if (typeof id === 'number') {
                            id = id.toString();
                        }
                        return items[id];
                    });
                }
            }
        }
        return [];
    }

    public clear() {
        return actionTypes.clearModel(this._entityName);
    }

    public static clear() {
        return actionTypes.clearAllModel();
    }

    private createHash(url: string = '', data: any = '') {
        const dataForHashing = `${url}${JSON.stringify(data)}`;
        const hash = md5(dataForHashing).toString();
        return hash;
    }

    private isHashExist(url: string, data: any) {
        const hashes = this.di.redux?.state?.hashes;
        const existedHashTime = hashes[this.createHash(url, data)];
        return existedHashTime
            ? existedHashTime + OUT_OF_DATE_HASH_TIME > Date.now() // if hash exist, check its expiration time (expired - false, else true)
            : false;
    }

    private saveDataToHash(url: string, data: any) {
        const hash = this.createHash(url, data);
        this.di.redux.dispatch(
            actionTypes.saveToHash({hash, dateUTC: Date.now()}),
        );
    }

    public handleUnsuccessResponse(
        response: any,
        title: string | undefined = undefined,
        showDefaultTitle: boolean = false,
    ) {
        if (response?.error != undefined || response?.code == 'ERROR') {
            const {t, ToastEmitter} = this.di;
            let actualTitle =
                title ?? showDefaultTitle
                    ? t('default-error-title')
                    : undefined;
            let message = response?.error;
            if (message == undefined) {
                if (response.code == 'ERROR') {
                    message = response.message ?? 'default-error-message';
                } else {
                    message = 'default-error-message';
                }
            }
            message = t(message);

            if (actualTitle != undefined) {
                ToastEmitter.errorMessage(actualTitle + '\n' + message);
            } else {
                ToastEmitter.errorMessage(message);
            }
        }
    }
}
