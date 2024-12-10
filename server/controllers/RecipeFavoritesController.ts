import BaseController from './BaseController';
import {POST, USE} from 'server/decorators';
import authTokenCheck from '../middleware/authTokenCheck';
import entity from 'server/decorators/entity';
import validate from '../middleware/validate';
import {ResponseCode} from '@/src/constants';
import {GRANT, ROLE} from '@/acl/types';

@entity('RecipeFavoritesEntity')
export default class RecipeFavoritesController extends BaseController {
    @USE(authTokenCheck)
    @USE(
        validate({
            type: ['object', 'array'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        user_id: {type: 'null'},
                        recipe_id: {type: 'string'},
                        favorite_type: {type: ['string', 'null']},
                        machine_id: {type: 'string'},
                    },
                    required: ['machine_id', 'recipe_id', 'favorite_type'],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: {type: 'string'},
                            user_id: {type: 'null'},
                            recipe_id: {type: 'string'},
                            favorite_type: {type: ['string', 'null']},
                            machine_id: {type: 'string'},
                        },
                        required: ['machine_id', 'recipe_id', 'favorite_type'],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/recipe-favorites/save/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    @POST('api/recipe-favorites/delete/machine', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    public saveRecipeFavoritesMachine({query, fnMessage, fnError, items}) {
        const {RecipeFavoritesService} = this.di;
        fnMessage('success-save-recipe-favorites');
        fnError('error-save-recipe-favorites', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return RecipeFavoritesService.saveMachine(singleQuery);
                }),
            )
        } else {
            return RecipeFavoritesService.saveMachine(query);
        }
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: ['object', 'array'],
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        user_id: {type: 'string'},
                        recipe_id: {type: 'string'},
                        favorite_type: {type: ['string', 'null']},
                        machine_id: {type: 'null'},
                    },
                    required: ['user_id', 'recipe_id', 'favorite_type'],
                    additionalProperties: false,
                },
                {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: {type: 'string'},
                            user_id: {type: 'string'},
                            recipe_id: {type: 'string'},
                            favorite_type: {type: ['string', 'null']},
                            machine_id: {type: 'null'},
                        },
                        required: ['user_id', 'recipe_id', 'favorite_type'],
                        additionalProperties: false,
                    },
                },
            ],
        }),
    )
    @POST('api/recipe-favorites/save/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @POST('api/recipe-favorites/delete/user', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public saveRecipeFavoritesUser({query, fnMessage, fnError, items}) {
        const {RecipeFavoritesService} = this.di;
        fnMessage('success-save-recipe-favorites');
        fnError('error-save-recipe-favorites', ResponseCode.TOAST);
        if (Array.isArray(items) && items.length > 0) {
            return Promise.all(
                items.map(singleQuery => {
                    return RecipeFavoritesService.saveUser(singleQuery);
                }),
            );
        } else {
            return RecipeFavoritesService.saveUser(query);
        }
    }
}

/* 

if set favorite, we send:
{
    id,
    user_id or machine_id or both null(if global),
    recipe_id,
    favorite_type: Bookmark or Star
}

if delete favorite, we send:
{
    id,
    user_id or machine_id or both null(if global),
    recipe_id,
    favorite_type: null
}



*/
