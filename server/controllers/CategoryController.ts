import BaseController from './BaseController';
import {GET, POST, SSR, USE} from 'server/decorators';
import authTokenCheck from '../middleware/authTokenCheck';
import entity from 'server/decorators/entity';
import validate from '../middleware/validate';
import {GRANT, ROLE} from '@/acl/types';
import {ResponseCode} from '@/src/constants';

import {ENTITY} from '@/src/constants';
import * as actionTypes from '@/store/types/actionTypes';
@entity('CategoryEntity')
export default class CategoryController extends BaseController {
    @USE(authTokenCheck)
    @SSR('/home/categories', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getCategoriesSSR({query, pager, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-find-category');
        fnError('error-find-category', ResponseCode.TOAST);
        return CategoryService.getCategoriesAdminRecipe();
    }

    @GET('api/categories', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public getCategories({query, pager, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-find-category');
        fnError('error-find-category', ResponseCode.TOAST);
        return CategoryService.getCategoriesAdminRecipe();
    }

    /**
     * saveManufacturer
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                category_name: {type: 'string'},
                id: {type: 'string'},
                parent_id: {type: ['string', 'null']},
                recipe_process: {type: 'string'},
                user_id: {type: 'null'},
                machine_id: {type: 'null'},
            },
            required: ['category_name', 'recipe_process'],
            additionalProperties: false,
        }),
    )
    @POST('api/categories/save/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public async saveManufacturer({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-save-category', 'TOAST');
        fnError('error-save-category', 'TOAST');
        const data = await CategoryService.saveToRoot({
            ...query,
            user_id: null,
            machine_id: null,
        });
        return data;
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                category_name: {type: 'string'},
                id: {type: 'string'},
                parent_id: {type: ['string', 'null']},
                recipe_process: {type: 'string'},
                media_resource: {type: 'string'},
                machine_id: {type: 'null'},
                user_id: {type: 'string'},
            },
            required: ['category_name', 'recipe_process'],
            additionalProperties: false,
        }),
    )
    @POST('api/categories/save/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public saveToUser({query, identity, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-save-category', ResponseCode.OK);
        fnError('error-save-category', ResponseCode.TOAST);
        return CategoryService.saveToUser({
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
                        category_name: { type: 'string' },
                        id: { type: 'string' },
                        parent_id: { type: 'string' },
                        recipe_process: { type: 'string' },
                        machine_id: { type: 'string' },
                        uid: { type: 'string' },
                        media_resource: { type: ['string', 'null'] },
                        user_id: { type: 'null' },
                    },
                    required: ['category_name', 'recipe_process', 'uid', 'id'],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category_name: { type: 'string' },
                            id: { type: 'string' },
                            parent_id: { type: 'string' },
                            recipe_process: { type: 'string' },
                            machine_id: { type: 'string' },
                            uid: { type: 'string' },
                            media_resource: { type: ['string', 'null'] },
                            user_id: { type: 'null' },
                        },
                        required: ['category_name', 'recipe_process', 'uid', 'id'],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/categories/save/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public saveToMachine({query, identity, fnMessage, fnError, items}) {
        const {CategoryService} = this.di;
        fnMessage('success-save-category');
        fnError('error-save-category', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return CategoryService.saveToMachine({
                        ...singleQuery,
                        user_id: null,
                    });
                }),
            );
        } else {
            return CategoryService.saveToMachine({
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
    @POST('api/categories/delete/manufacturer', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public async deleteManufacturer({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-delete-category', 'TOAST');
        fnError('error-delete-category', 'TOAST');
        const data = await CategoryService.deleteCategory(query, null);
        return data;
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
    @POST('api/categories/delete/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public deleteFromUser({query, identity, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-delete-category', ResponseCode.TOAST);
        fnError('error-delete-category', ResponseCode.TOAST);
        return CategoryService.deleteCategory(query, identity?.userId);
    }

    @USE(authTokenCheck)  
    @USE(
        validate({
            type: ['object', 'array'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        category_name: { type: 'string' },
                        id: { type: 'string' },
                        parent_id: { type: 'string' },
                        recipe_process: { type: 'string' },
                        machine_id: { type: 'string' },
                        uid: { type: 'string' },
                        media_resource: { type: ['string', 'null'] },
                        user_id: { type: 'null' },
                    },
                    required: ['id', 'machine_id'],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category_name: { type: 'string' },
                            id: { type: 'string' },
                            parent_id: { type: 'string' },
                            recipe_process: { type: 'string' },
                            machine_id: { type: 'string' },
                            uid: { type: 'string' },
                            media_resource: { type: ['string', 'null'] },
                            user_id: { type: 'null' },
                        },
                        required: ['id', 'machine_id'],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/categories/delete/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public deleteFromMachine({query, identity, fnMessage, fnError, items}) {
        const {CategoryService} = this.di;
        fnMessage('success-delete-category');
        fnError('error-delete-category', ResponseCode.TOAST);

        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return CategoryService.deleteCategory(singleQuery, null);
                }),
            );
        } else {
            return CategoryService.deleteCategory(query, null);
        }

    }

    @USE(authTokenCheck)
    @SSR('/home/recipes/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @SSR('/home/recipes/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @SSR('/home/presets/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @SSR('/home/presets/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public findRecipeInfo({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-find-category');
        fnError('error-find-category', ResponseCode.TOAST);
        return CategoryService.getCategoriesAdminRecipe();
    }

    @USE(authTokenCheck)
    @SSR('/invitation/recipe/:id', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
        deny: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public invitationRecipeConfirmCategory({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-find-category');
        fnError('error-find-category', ResponseCode.TOAST);
        return CategoryService.getCategoriesUserForGuest();
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                uid: {type: 'string'},
            },
            required: ['uid'],
            additionalProperties: false,
        }),
    )
    @POST('api/categories/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public getCategoriesMachine({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        fnMessage('success-delete-category', 'ResponseCode.TOAST');
        fnError('error-delete-category', 'ResponseCode.TOAST');
        return CategoryService.getCategoriesMachine(query.uid);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                // uid: {type: 'string'},
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/categories/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ, GRANT.GET],
        },
    })
    public getCategoriesUser({query, fnMessage, fnError, identity}) {
        const {CategoryService} = this.di;
        fnMessage('success-delete-category', 'ResponseCode.TOAST');
        fnError('error-delete-category', 'ResponseCode.TOAST');
        return CategoryService.getCategoriesUser(identity.userId);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                machine_id: {type: 'string'},
                name: {type: 'string'},
                id: {type: 'string'},
            },
            required: ['machine_id', 'name', 'id'],
            additionalProperties: false,
        }),
    )
    @POST('api/categories/delete/file/:id/:name', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public deleteFile({query, fnMessage, fnError}) {
        const {CategoryService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return CategoryService.deleteFile({
            id,
            name,
            machine_id: query.machine_id,
        });
    }
}
