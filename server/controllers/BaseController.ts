import Guard from '@/acl/Guard';
import {GRANT} from '@/acl/types';
import {
    DEFAULT_PER_PAGE,
    ENTITY,
    ErrorCode,
    GUEST_IDENTITY,
    ResponseCode,
} from '@/src/constants';
import {NextApiRequest, NextApiResponse} from 'next';
import {createRouter} from 'next-connect';
import BaseContext from 'server/di/BaseContext';
import IContextContainer from 'server/di/interfaces/IContextContainer';
import clientContainer from 'src/di/clientContainer';
import {BaseEntity} from 'src/entities/BaseEntity';
import {IPagerParams} from 'src/pagination/IPagerParams';

export default class BaseController extends BaseContext {
    private _entity: BaseEntity;
    constructor(opts: IContextContainer) {
        super(opts);
    }

    protected set entity(entityName) {
        this._entity = clientContainer.resolve(entityName);
    }

    public normalizedAction(data) {
        if (this._entity == null) {
            const entityName = Reflect.getMetadata('entity', this.constructor);
            this._entity = clientContainer.resolve(entityName);
        }
        return this._entity.normalizedAction(data);
    }

    private useClassMiddleware() {
        const key = this.constructor.name;
        const methodMiddleware = Reflect.getMetadata(key, this.constructor);
        const methodArgs = Array.isArray(methodMiddleware)
            ? methodMiddleware
            : [];
        return methodArgs;
    }

    private useMethodMiddleware(methodName: string) {
        const key = this.constructor.name + '_' + methodName;
        const methodMiddleware = Reflect.getMetadata(key, this.constructor);
        const methodArgs = Array.isArray(methodMiddleware)
            ? methodMiddleware
            : [];
        return methodArgs;
    }

    private buildGuard(
        req: NextApiRequest,
        res: NextApiResponse | null,
        isSSR = false,
    ) {
        const {roles, rules, config} = this.di;
        req.guard = new Guard(roles, rules);

        const path = req.url.toString();
        for (const item of config.IGNORS) {
            if (path.startsWith(item)) {
                return {error: null};
            }
        }

        req.guard.resource = isSSR ? req.url : req.url.slice(1);
        if (req.identity) {
            req.guard.build(req.identity);
        }
        const allow = req.guard.allow(req.method as GRANT);
        const error = {
            code: 403,
            message: ErrorCode.ForbiddenResource,
        };
        if (isSSR) {
            return {
                error: allow ? null : error,
                allow,
            };
        } else if (!allow) {
            res.status(401).json(error);
        }
        return {allow};
    }

    public handler(routeName: string) {

        this.di.logger.info("ROUTE REQUEST: " + routeName)

        const members: any = Reflect.getMetadata(routeName, this);
        let pagers: any[] = Reflect.getMetadata('pagers', this);

        if (pagers == undefined) {
            pagers = [];
        }

        let cargs = this.useClassMiddleware();
        const router = createRouter<NextApiRequest, NextApiResponse>();

        if ('SSR' in members) {
            return async context => {
                const action = members['SSR'][0];
                const callback = this[action].bind(this);
                let margs = this.useMethodMiddleware(action);
                let pagerParams: IPagerParams;
                const isPager =
                    pagers?.find(x => x.methodName == action) != null;
                if (isPager) {
                    const page = parseInt(context.query.page || 1);
                    const pageName = context.query['pageName'];
                    const lastDocumentId = context.query['pageName'] ?? null;
                    const perPage = parseInt(
                        context.query.lastDocumentId || DEFAULT_PER_PAGE,
                    );
                    const filter = context.query.filter
                        ? context.query.filter
                        : null;
                    const sort = context.query.sort ? context.query.sort : null;
                    const entityName = context.query.entityName
                        ? context.query.entityName
                        : null;

                    pagerParams = {
                        page: page,
                        pageName: pageName,
                        perPage: perPage,
                        filter: filter,
                        sort: sort,
                        entityName: entityName,
                        lastDocumentId: lastDocumentId,
                    };
                }

                const fnRes =
                    (fieldName, isSuccess, defaultCode, defaultStatusCode) =>
                        (
                            message,
                            code = defaultCode,
                            statusCode: number = defaultStatusCode,
                        ) => {
                            context.query[fieldName] = {};
                            context.query[fieldName].isSuccess = isSuccess;
                            context.query[fieldName].message = message;
                            context.query[fieldName].code = code;
                            context.query[fieldName].statusCode = statusCode;
                        };

                const fnError = fnRes(
                    'errorResponse',
                    false,
                    ResponseCode.ERROR,
                    500,
                );
                const fnMessage = fnRes('response', true, ResponseCode.OK, 200);

                router.use(routeName, ...cargs, ...margs).get(async () => {
                    if (!context.req.identity) {
                        context.req.identity = GUEST_IDENTITY;
                    }
                    const guardRes = this.buildGuard(
                        context.req,
                        context.res,
                        true,
                    );
                    if (guardRes.error != null) {
                        return {
                            props: {
                                data: guardRes,
                            },
                        };
                    }
                    let data = await callback({
                        query: context.query,
                        pager: pagerParams,
                        identity: context.req.identity,
                        guard: context.req.guard,
                        fnMessage,
                        fnError,
                    })
                        .then(response => {
                            if (isPager) {
                                const pager = {
                                    count: response.count,
                                    page: pagerParams.page,
                                    pageName: pagerParams.pageName,
                                    perPage: pagerParams.perPage,
                                    entityName: pagerParams.entityName,
                                    lastDocumentId: pagerParams.lastDocumentId,
                                };
                                response = {
                                    data: response.items,
                                    pager,
                                };
                            } else {
                                response = {
                                    data: response,
                                };
                            }
                            return response;
                        })
                        .catch(error => {
                            this.di.logger.errorController(routeName, error?.message ?? "Error")
                            return {error};
                        });
                    data = JSON.parse(JSON.stringify(data));
                    return {
                        props: {
                            data,
                        },
                    };
                });

                return router.run(context.req, context.res);
            };
        }

        Object.keys(members).map(method => {
            for (let i = 0; i < members[method].length; i++) {
                const methodName: string = method.toLowerCase(); //GET, POST, PUT, etc
                const action = members[method][i];
                const callback = this[action].bind(this);
                if (typeof router[methodName] === 'function') {
                    let margs = this.useMethodMiddleware(action);
                    router[methodName](
                        routeName,
                        ...cargs,
                        ...margs,
                        (req: NextApiRequest, res: NextApiResponse) => {
                            if (req && !req.identity) {
                                req.identity = GUEST_IDENTITY;
                            }
                            const allowRes = this.buildGuard(req, res);
                            if (!allowRes.allow) {
                                return;
                            }
                            let pagerParams: IPagerParams | null = null;
                            const isPager =
                                pagers.find(x => x.methodName == action) !=
                                null;

                            if (isPager) {
                                const page = parseInt(req.body.page || 1);
                                const pageName = req.body['pageName'];
                                const lastDocumentId =
                                    req.body['lastDocumentId'];
                                const perPage = parseInt(
                                    req.body.perPage || DEFAULT_PER_PAGE,
                                );
                                const filter = req.body.filter
                                    ? req.body.filter
                                    : null;
                                const sort = req.body.sort
                                    ? req.body.sort
                                    : null;
                                const entityName = req.body.entityName
                                    ? req.body.entityName
                                    : null;

                                pagerParams = {
                                    page: page,
                                    pageName: pageName,
                                    perPage: perPage,
                                    filter: filter,
                                    sort: sort,
                                    entityName: entityName,
                                    lastDocumentId: lastDocumentId,
                                };
                            }

                            const fnRes =
                                (
                                    fieldName,
                                    isSuccess,
                                    defaultCode,
                                    defaultStatusCode,
                                ) =>
                                    (
                                        message,
                                        code = defaultCode,
                                        statusCode: number = defaultStatusCode,
                                    ) => {
                                        req[fieldName] = {};
                                        req[fieldName].isSuccess = isSuccess;
                                        req[fieldName].message = message;
                                        req[fieldName].code = code;
                                        req[fieldName].statusCode = statusCode;
                                    };

                            const fnError = fnRes(
                                'errorResponse',
                                false,
                                ResponseCode.ERROR,
                                500,
                            );
                            const fnMessage = fnRes(
                                'response',
                                true,
                                ResponseCode.OK,
                                200,
                            );
                            let items = [];
                            let query = {};
                            if (Array.isArray(req?.body)) {
                                items =  req?.body;
                                query =  req.query;
                            } else {
                                query =  {...req.query, ...req?.body};
                            }
                            callback({
                                query,
                                identity: req.identity,
                                guard: req.guard,
                                pager: pagerParams,
                                fnMessage,
                                fnError,
                                items,
                            })
                                .then(response => {
                                    if (isPager) {
                                        const pager = {
                                            count: response.count,
                                            page: pagerParams?.page,
                                            pageName: pagerParams?.pageName,
                                            perPage: pagerParams?.perPage,
                                            entityName: pagerParams?.entityName,
                                            lastDocumentId:
                                                pagerParams?.lastDocumentId,
                                        };
                                        response = {
                                            data: response.items,
                                            pager,
                                        };
                                    } else {
                                        response = {
                                            data: response,
                                        };
                                    }
                                    return response;
                                })
                                .then(result => {
                                    const response = req['response'];
                                    response['data'] = result.data;
                                    if (result.pager) {
                                        response['pager'] = result.pager;
                                    }
                                    res.status(response.statusCode).json(
                                        response,
                                    );
                                })
                                .catch(error => {
                                    this.di.logger.errorController(routeName, error?.message ?? "Error", "API")
                                    const errorResponse = req['errorResponse'];
                                    if (errorResponse) {
                                        res.status(
                                            errorResponse.statusCode,
                                        ).json(errorResponse);
                                    } else {
                                        res.status(400).json(error);
                                    }
                                });
                        },
                    );
                }
            }
        });

        return router.handler({
            onError: (err:any, req, res) => {
                const errorResponse = req['errorResponse'];
                if(req['errorResponse']?.message){
                    this.di.logger.errorController(routeName, req['errorResponse']?.message, "API")            
                }else if (err?.message) {
                    this.di.logger.errorController(routeName, err.message, "API")
                }
                if (errorResponse) {
                    res.status(errorResponse.statusCode).json(errorResponse);
                } else {
                    res.status(400).json(err);
                }
            },
        });
    }

    protected json(params: any) {
        return JSON.parse(JSON.stringify(params));
    }
}
