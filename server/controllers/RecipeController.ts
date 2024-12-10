import BaseController from './BaseController';
import {GET, POST, SSR, USE, pager} from 'server/decorators';
import authTokenCheck from '../middleware/authTokenCheck';
import entity from 'server/decorators/entity';
import validate, {validateProps} from '../middleware/validate';
import {DEFAULT_PER_PAGE, ResponseCode} from '@/src/constants';
import {GRANT, ROLE} from '@/acl/types';
import {RecipeProcessType} from '../models/ICategoryModel';

@entity('RecipeEntity')
export default class RecipeController extends BaseController {
    @USE(authTokenCheck)
    @pager()
    @SSR('/home/recipes', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getRecipesSSR({query, pager, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        pager.filter = {recipe_process: RecipeProcessType.Recipe};
        pager.perPage = pager?.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'recipes';
        pager.pageName = pager?.pageName ?? 'recipes';
        // pager.sort = {
        //     field: query['s'] ?? 'recipe_name',
        //     dir: query['sd'] ?? 'asc',
        // };
        pager.sort = pager.sort;
        fnMessage('success-recipe-info');
        fnError('error-recipe-info');
        return RecipeService.pageCached(pager);
    }

    @USE(authTokenCheck)
    @SSR('/home/recipes/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @SSR('/home/presets/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getAddRecipe() {
        return Promise.resolve({});
    }

    @pager()
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                page: {type: 'number'},
                count: {type: 'number'},
                pageName: {type: 'string'},
                force: {type: 'boolean'},
                perPage: {type: 'number'},
                filter: {
                    type: 'object',
                    additionalProperties: true,
                },
                sort: {
                    type: 'object',
                    additionalProperties: true,
                },
                entityName: {type: 'string'},
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/page', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public getRecipesPaginated({pager, fnMessage, fnError, identity}) {
        const {RecipeService} = this.di;
        pager.filter = {
            ...pager.filter,
            recipe_process: RecipeProcessType.Recipe,
            user_id: null,
            machine_id: null,
        };
        pager.perPage = pager.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'recipes';
        // pager.pageName = query?.pageName ?? 'recipes';
        pager.pageName = pager?.pageName ?? 'recipes';
        pager.sort = pager.sort;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.pageCached(pager, identity.userId);
    }

    @pager()
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                page: {type: 'number'},
                count: {type: 'number'},
                pageName: {type: 'string'},
                perPage: {type: 'number'},
                filter: {
                    type: 'object',
                    additionalProperties: true,
                },
                sort: {
                    type: 'object',
                    additionalProperties: true,
                },
                entityName: {type: 'string'},
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/page/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public getRecipesPaginatedMachine({query, pager, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        pager.filter = {
            ...pager.filter,
            recipe_process: RecipeProcessType.Recipe,
        };
        pager.perPage = pager?.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'my-recipes';
        pager.pageName = query?.pageName ?? 'my-recipes';
        // pager.sort = {
        //     field: query['s'] ?? 'recipe_name',
        //     dir: query['sd'] ?? 'asc',
        // };
        pager.sort = pager.sort;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.pageMachine(pager);
    }

    @pager()
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                page: {type: 'number'},
                count: {type: 'number'},
                pageName: {type: 'string'},
                uid: {type: 'string'},
                perPage: {type: 'number'},
                filter: {
                    type: 'object',
                    additionalProperties: true,
                },
                sort: {
                    type: 'object',
                    additionalProperties: true,
                },
                entityName: {type: 'string'},
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public getRecipesMachine({query, pager, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        pager.filter = {
            ...query,
            recipe_process: RecipeProcessType.Recipe,
        };

        pager.sort = pager.sort;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.pageMachine(query);
    }

    @pager()
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                page: {type: 'number'},
                count: {type: 'number'},
                pageName: {type: 'string'},
                perPage: {type: 'number'},
                filter: {
                    type: 'object',
                    additionalProperties: true,
                },
                sort: {
                    type: 'object',
                    additionalProperties: true,
                },
                force: {type: 'boolean'},
                entityName: {type: 'string'},
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/page/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public getRecipesPaginatedUser({
        query,
        pager,
        fnMessage,
        fnError,
        identity,
    }) {
        const {RecipeService} = this.di;
        pager.filter = {
            ...pager.filter,
            recipe_process: RecipeProcessType.Recipe,
        };
        pager.perPage = pager?.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'my-recipes';
        pager.pageName = query?.pageName ?? 'my-recipes';
        // pager.sort = {
        //     field: query['s'] ?? 'recipe_name',
        //     dir: query['sd'] ?? 'asc',
        // };
        pager.sort = pager.sort;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.pageUser(pager, identity.userId);
    }

    @pager()
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                page: {type: 'number'},
                count: {type: 'number'},
                pageName: {type: 'string'},
                perPage: {type: 'number'},
                filter: {
                    type: 'object',
                    additionalProperties: true,
                },
                force: {type: 'boolean'},
                sort: {
                    type: 'object',
                    additionalProperties: true,
                },
                entityName: {type: 'string'},
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/presets/page', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public getPresetssPaginated({query, pager, fnMessage, fnError, identity}) {
        const {RecipeService} = this.di;
        pager.filter = {
            ...pager.filter,
            recipe_process: RecipeProcessType.Preset,
        };
        pager.perPage = pager?.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'presets';
        pager.pageName = pager?.pageName ?? 'presets';
        // pager.sort = {
        //     field: query['s'] ?? 'recipe_name',
        //     dir: query['sd'] ?? 'asc',
        // };
        pager.sort = pager.sort;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.pageCached(pager, identity.userId);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
            },
            required: ['id'],
            additionalProperties: false,
        }),
    )
    @GET('api/recipes/:id', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    @SSR('/home/recipes/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @GET('api/presets/:id', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    @SSR('/home/presets/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public findRecipeInfo({query, fnMessage, fnError}) {
        const id = query['id'] as string;
        const {RecipeService} = this.di;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.findRecipeInfo(id);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                uid: {type: 'string'},
            },
            required: ['id', 'uid'],
            additionalProperties: false,
        }),
    )
    @GET('api/recipes/:id/machine/:uid', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public findRecipeMachineInfo({query, fnMessage, fnError}) {
        const id = query['id'] as string;
        const uid = query['uid'] as string;
        const {RecipeService} = this.di;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.findRecipeMachineInfo(id, uid);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
            },
            required: ['id'],
            additionalProperties: false,
        }),
    )
    @GET('api/recipes/:id/user', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public findRecipeUserInfo({query, fnMessage, fnError, identity}) {
        const id = query['id'] as string;
        const {RecipeService} = this.di;
        fnMessage('success-info');
        fnError('error-info');
        return RecipeService.findRecipeUserInfo(id, identity?.userId);
    }

    /**
     * saveManufacturer
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                description: {type: 'string'},
                media_resources: {
                    type: 'array',
                    items: {type: 'string'},
                },
                id: {type: 'string'},
                machine_type: {type: 'string'},
                recipe_name: {type: 'string'},
                recipe_ingredients: {
                    type: 'array',
                    items: validateProps.recipeIngredients,
                },
                recipe_process: {type: 'string'},
                stages: {type: 'array', items: validateProps.stages},
                user_id: {type: ['string', 'null']},
                machine_id: {type: ['string', 'null']},
                type_session: {type: 'string'},
                categories: {
                    type: 'array',
                    items: {type: 'string'},
                },
                search_terms: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByMachines: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByUsers: {
                    type: 'array',
                    items: {type: 'string'},
                },
            },
            required: [
                'machine_type',
                'recipe_name',
                'categories',
                'recipe_process',
                'type_session',
            ],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/save/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public saveManufacturer({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        fnMessage('success-save-recipe', ResponseCode.OK);
        fnError('error-save-recipe', ResponseCode.TOAST);
        return RecipeService.saveToRoot({
            ...query,
            user_id: null,
            machine_id: null,
        });
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                description: {type: 'string'},
                id: {type: 'string'},
                media_resources: {
                    type: 'array',
                    items: {type: 'string'},
                },
                machine_type: {type: 'string'},
                recipe_name: {type: 'string'},
                recipe_ingredients: {
                    type: 'array',
                    items: validateProps.recipeIngredients,
                },
                recipe_process: {type: 'string'},
                stages: {type: 'array', items: validateProps.stages},
                categories: {
                    type: 'array',
                    items: {type: 'string'},
                },
                type_session: {type: 'string'},
                machine_id: {type: 'null'},
                user_id: {type: 'string'},
                search_terms: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByMachines: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByUsers: {
                    type: 'array',
                    items: {type: 'string'},
                },
            },
            required: ['machine_type', 'recipe_name', 'categories'],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/save/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public saveToUser({query, identity, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        fnMessage('success-save-recipe', ResponseCode.OK);
        fnError('error-save-recipe', ResponseCode.TOAST);
        return RecipeService.saveToUser({
            ...query,
            user_id: identity?.userId,
            machine_id: null,
        });
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: ['object', 'array'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        description: {type: 'string'},
                        id: {type: 'string'},
                        machine_type: {type: 'string'},
                        recipe_name: {type: 'string'},
                        type_session: {type: 'string'},
                        recipe_ingredients: {
                            type: 'array',
                            items: validateProps.recipeIngredients,
                        },
                        media_resources: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        recipe_process: {type: 'string'},
                        stages: {type: 'array', items: validateProps.stages},
                        uid: {type: 'string'},
                        categories: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        user_id: {type: 'null'},
                        machine_id: {type: 'string'},
                        search_terms: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        favoriteByMachines: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        favoriteByUsers: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                    },
                    required: [
                        'machine_type',
                        'recipe_name',
                        'uid',
                        'categories',
                        'id',
                    ],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            description: {type: 'string'},
                            id: {type: 'string'},
                            machine_type: {type: 'string'},
                            recipe_name: {type: 'string'},
                            type_session: {type: 'string'},
                            recipe_ingredients: {
                                type: 'array',
                                items: validateProps.recipeIngredients,
                            },
                            media_resources: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            recipe_process: {type: 'string'},
                            stages: {
                                type: 'array',
                                items: validateProps.stages,
                            },
                            uid: {type: 'string'},
                            categories: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            user_id: {type: ['null', 'string']},
                            machine_id: {type: ['null', 'string']},
                            search_terms: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            favoriteByMachines: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            favoriteByUsers: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                        },
                        required: [
                            'machine_type',
                            'recipe_name',
                            'uid',
                            'categories',
                            'id',
                        ],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/recipes/save/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public saveToMachine({query, identity, fnMessage, fnError, items}) {
        const {RecipeService} = this.di;
        fnMessage('success-save-recipe');
        fnError('error-save-recipe', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return RecipeService.saveToMachine({
                        ...singleQuery,
                        user_id: null,
                    });
                }),
            );
        } else {
            return RecipeService.saveToMachine({
                ...query,
                user_id: null,
            });
        }
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: {type: 'string'},
            },
            required: ['id'],
            additionalProperties: false,
            errorMessage: {
                additionalProperties: 'should-have-properties',
                required: {
                    id: 'should have an integer property "foo"',
                },
            },
        }),
    )
    @POST('api/recipes/delete/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @POST('api/presets/delete/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteManufacturer({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        fnMessage('success-delete', ResponseCode.TOAST);
        fnError('error-delete', ResponseCode.TOAST);
        return RecipeService.deleteRecipe({...query, user_id: null});
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: {type: 'string'},
            },
            required: ['id'],
            additionalProperties: false,
            errorMessage: {
                additionalProperties: 'should-have-properties',
                required: {
                    id: 'should have an integer property "foo"',
                },
            },
        }),
    )
    @POST('api/recipes/delete/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public deleteFromUser({query, identity, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        fnMessage('success-delete-recipe', ResponseCode.TOAST);
        fnError('error-delete-recipe', ResponseCode.TOAST);
        return RecipeService.deleteRecipe({
            ...query,
            user_id: identity?.userId,
        });
    }

    
    @USE(authTokenCheck)
    @USE(
        validate({
            type: ['object', 'array'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        description: {type: 'string'},
                        id: {type: 'string'},
                        machine_type: {type: 'string'},
                        recipe_name: {type: 'string'},
                        type_session: {type: 'string'},
                        recipe_ingredients: {
                            type: 'array',
                            items: validateProps.recipeIngredients,
                        },
                        media_resources: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        recipe_process: {type: 'string'},
                        stages: {type: 'array', items: validateProps.stages},
                        uid: {type: 'string'},
                        categories: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        user_id: {type: 'null'},
                        machine_id: {type: 'string'},
                        search_terms: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        favoriteByMachines: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                        favoriteByUsers: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                    },
                    required: [
                        'id', 'machine_id',
                    ],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            description: {type: 'string'},
                            id: {type: 'string'},
                            machine_type: {type: 'string'},
                            recipe_name: {type: 'string'},
                            type_session: {type: 'string'},
                            recipe_ingredients: {
                                type: 'array',
                                items: validateProps.recipeIngredients,
                            },
                            media_resources: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            recipe_process: {type: 'string'},
                            stages: {
                                type: 'array',
                                items: validateProps.stages,
                            },
                            uid: {type: 'string'},
                            categories: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            user_id: {type: 'null'},
                            machine_id: {type: 'string'},
                            search_terms: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            favoriteByMachines: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                            favoriteByUsers: {
                                type: 'array',
                                items: {type: 'string'},
                            },
                        },
                        required: [
                            'id', 'machine_id'
                        ],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/recipes/delete/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public deleteFromMachine({query, identity, fnMessage, fnError, items}) {
        const {RecipeService} = this.di;
        fnMessage('success-delete-recipe');
        fnError('error-delete-recipe', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return RecipeService.deleteRecipe({
                        ...singleQuery,
                        user_id: null,
                    });
                }),
            );
        } else {
            return RecipeService.deleteRecipe({
                ...query,
                user_id: null,
            });
        }
    }

    /* PRESETS */
    @USE(authTokenCheck)
    @pager()
    @SSR('/home/presets', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getPresetsSSR({query, pager, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        pager.filter = {recipe_process: RecipeProcessType.Preset};
        pager.perPage = pager?.perPage ?? DEFAULT_PER_PAGE;
        pager.entityName = pager?.entityName ?? 'presets';
        pager.pageName = pager?.pageName ?? 'presets';
        // pager.sort = {
        //     field: query['s'] ?? 'recipe_name',
        //     dir: query['sd'] ?? 'asc',
        // };
        pager.sort = pager.sort;
        fnMessage('success-preset-info');
        fnError('error-preset-info');
        return RecipeService.pageCached(pager);
    }

    /**
     * savePresetManufacturer
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                description: {type: 'string'},
                id: {type: 'string'},
                machine_type: {type: 'string'},
                recipe_name: {type: 'string'},
                recipe_process: {type: 'string'},
                stages: {type: 'array', items: validateProps.stages},
                moisture: {type: 'number'},
                media_resources: {
                    type: 'array',
                    items: {type: 'string'},
                },
                base_thickness: {type: 'number'},
                type_session: {type: 'string'},
                user_id: {type: ['string', 'null']},
                machine_id: {type: ['string', 'null']},
                categories: {
                    type: 'array',
                    items: {type: 'string'},
                },
                temperature: {
                    type: 'object',
                    properties: {
                        adjustment: {type: 'number'},
                        marinated: {type: 'number'},
                        thickness: {type: 'number'},
                    },
                },
                time: {
                    type: 'object',
                    properties: {
                        adjustment: {type: 'number'},
                        marinated: {type: 'number'},
                        thickness: {type: 'number'},
                    },
                },
                search_terms: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByMachines: {
                    type: 'array',
                    items: {type: 'string'},
                },
                favoriteByUsers: {
                    type: 'array',
                    items: {type: 'string'},
                },
            },
            required: [
                'machine_type',
                'recipe_name',
                'recipe_process',
                'base_thickness',
            ],
            additionalProperties: false,
        }),
    )
    @POST('api/presets/save/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public savePresetManufacturer({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        fnMessage('success-save-preset', ResponseCode.OK);
        fnError('error-save-preset', ResponseCode.TOAST);
        return RecipeService.saveToRoot({
            ...query,
            user_id: null,
            machine_id: null,
        });
    }

    @USE(authTokenCheck)
    @POST('api/recipes/delete/file/:id/:name', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteFile({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return RecipeService.deleteFile({
            id,
            name,
        });
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                uid: {type: 'string'},
                id: {type: 'string'},
                name: {type: 'string'},
            },
            required: ['uid', 'name', 'id'],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/delete/file/machine/:id/:name', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteFileMachines({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        const uid = query['uid'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return RecipeService.deleteFile({
            id,
            name,
            uid,
        });
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                uid: {type: 'string'},
                id: {type: 'string'},
                name: {type: 'string'},
            },
            required: ['uid', 'name', 'id'],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/delete/method-file/machine/:id/:name', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteMethodFileMachines({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        const uid = query['uid'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return RecipeService.deleteMethodFile({
            id,
            name,
            uid,
        });
    }

    @USE(authTokenCheck)
    @POST('api/recipes/delete/method-file/:id/:name', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteMethodFile({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return RecipeService.deleteMethodFile({
            id,
            name,
        });
    }


    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: {type: 'string'},
            },
            required: ['id'],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/machine/:id', {
        allow: {
            [ROLE.OWNER]: [GRANT.READ],
        },
    })
    public getRecipesBYMachine({query, fnMessage, fnError}) {
        const {RecipeService} = this.di;
        const uid = query['id'] as string;
        fnMessage('success-my-recipes-fetching');
        fnError('error-my-recipes-fetching');
        return RecipeService.getRecipesByMachine(uid);
    }

    @USE(
        validate({
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: { type: 'string' },
                    categories: {
                        type: 'array',
                        items: {type: 'string'},
                    },
                    media_resources: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                    machine_type: { type: 'string' },
                    recipe_name: { type: 'string' },
                    recipe_ingredients: {
                        type: 'array',
                        items: validateProps.recipeIngredients,
                    },
                    recipe_process: { type: 'string' },
                    stages: {
                        type: 'array',
                        items: validateProps.stages,
                    },
                    machine_id: { type: ['string', 'null'] },
                    user_id: { type: ['string', 'null'] },
                    type_session: { type: 'string' },
                    id: { type: 'string' },
                },
                required: ['recipe_name', 'machine_type', 'id'],
                additionalProperties: false,
            },
        }),
    )  
    @POST('api/recipes/share', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public shareRecipe({query, fnMessage, fnError, items}) {
        const {RecipeService, InvitationService} = this.di;
        fnMessage('success-save-recipe');
        fnError('error-save-recipe', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            // InvitationService.deleteInvitation
            return Promise.all(
                items.map(singleQuery => {
                    const {folder, sQuery} = singleQuery
                    return RecipeService.saveToUserShareRecipe(sQuery, folder);
                }),
            );
        } else {
            const {folder, mQuery} = query
            return RecipeService.saveToUserShareRecipe(mQuery, folder);
        }
    }
}
