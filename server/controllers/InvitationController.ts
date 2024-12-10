import BaseController from './BaseController';
import {GET, POST, SSR, USE} from 'server/decorators';
import validate, {validateProps} from 'server/middleware/validate';
import entity from 'server/decorators/entity';
import authTokenCheck from '../middleware/authTokenCheck';
import {GRANT, ROLE} from '@/acl/types';
import type {ActionProps} from '.';
import {ErrorCode, MessageCode} from '@/src/constants';

@entity('InvitationEntity')
export default class InvitationController extends BaseController {
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        receiverFirstName: {type: 'string'},
                        receiverLastName: {type: 'string'},
                        receiverEmail: {type: 'string'},
                        accessData: {
                            type: 'array',
                            items: validateProps.machineAccess,
                        },
                        lng: {type: 'string'},
                    },
                    required: ['receiverEmail', 'accessData'],
                    additionalProperties: false,
                },
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/invite', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async inviteUser({query, identity, fnMessage, fnError}: ActionProps) {
        const {InvitationService} = this.di;
        const data = query['data'];
        fnMessage(MessageCode.InviteSent);
        fnError(ErrorCode.InviteSentFailed);
        return InvitationService.sendInvitation(identity.userId, data, fnError);
    }

    @SSR('/invitation/:id', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
        deny: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async invitationConfirm({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {InvitationService} = this.di;
        const id = query['id'] as string;
        fnMessage(MessageCode.InviteReceived);
        fnError(ErrorCode.InviteReceiveFailed);
        return InvitationService.findInvitationInfoExpended(id);
    }

    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: {
                    type: 'object',
                    properties: {
                        uid: {type: 'string'},
                        email: {type: 'string'},
                    },
                    required: ['uid', 'email'],
                    additionalProperties: false,
                },
            },
            required: ['data', 'id'],
            additionalProperties: false,
        }),
    )
    @POST('api/invitations/:id/accept', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async acceptInvite({query, fnMessage, fnError}: ActionProps) {
        const {InvitationService} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage(MessageCode.InviteAccepted);
        fnError(ErrorCode.InviteAcceptFailed);
        return InvitationService.invitationAcceptCompletion(
            id,
            data.uid,
            data.email,
        );
    }

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
    @POST('api/invitations/:id/reject', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async rejectInvite({query, fnMessage, fnError}: ActionProps) {
        const {InvitationService} = this.di;
        const id = query['id'] as string;
        fnMessage(MessageCode.InviteAccepted);
        fnError(ErrorCode.InviteAcceptFailed);
        return InvitationService.rejectInvitation(id);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        receiverFirstName: {type: 'string'},
                        receiverLastName: {type: 'string'},
                        receiverEmail: {type: 'string'},
                        folder: {type: 'string'},
                        accessData: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {type: 'string'},
                                    description: {type: 'string'},
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
                                    stages: {
                                        type: 'array',
                                        items: validateProps.stages,
                                    },
                                    machine_id: {type: ['string', 'null']},
                                    type_session: {type: 'string'},
                                    folder: {type: 'string'},
                                },
                                required: [
                                    'machine_type',
                                    'recipe_name',
                                    'recipe_process',
                                    'type_session',
                                    'id',
                                ],
                                additionalProperties: false,
                            },
                        },
                        lng: {type: 'string'},
                    },
                    required: ['receiverEmail', 'accessData'],
                    additionalProperties: false,
                },
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/recipes/invite', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async shareRecipe({query, identity, fnMessage, fnError}: ActionProps) {
        const {InvitationService} = this.di;
        const data = query['data'];
        fnMessage(MessageCode.InviteSent);
        fnError(ErrorCode.InviteSentFailed);
        return InvitationService.shareRecipe(identity.userId, data, fnError);
        // console.log('data', data);
        // return null;
    }

    @SSR('/invitation/recipe/:id', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
        deny: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async invitationRecipeConfirm({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        console.log('/invitation/recipe/:id');
        const {InvitationService} = this.di;
        const id = query['id'] as string;
        fnMessage(MessageCode.InviteReceived);
        fnError(ErrorCode.InviteReceiveFailed);
        return InvitationService.findInvitationInfoExpended(id);
    }

    @USE(
        validate({
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: {type: 'string'},
                    categories: {
                        type: 'array',
                        items: {type: 'string'},
                    },
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
                    stages: {
                        type: 'array',
                        items: validateProps.stages,
                    },
                    machine_id: {type: ['string', 'null']},
                    user_id: {type: ['string', 'null']},
                    type_session: {type: 'string'},
                    id: {type: 'string'},
                    folder: {type: 'string'},
                    invitationId: {type: 'string'},
                },
                required: ['recipe_name', 'machine_type', 'id'],
                additionalProperties: false,
            },
        }),
    )
    @POST('api/invitations/recipes/:id/accept', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public invitationsShareRecipe({query, fnMessage, fnError, items}) {
        const {RecipeService, InvitationService, UserService} = this.di;
        fnMessage('success-save-recipe');
        fnError(ErrorCode.InviteReceiveFailed);
        if (Array.isArray(items) && items.length > 0) {
            const recipeNames = items
                .map(singleQuery => singleQuery.recipe_name)
                .join(', ');
            return Promise.all(
                items.map(singleQuery => {
                    const {folder, ...singleItem} = singleQuery;
                    return RecipeService.saveToUserShareRecipe(
                        singleItem,
                        folder,
                    );
                }),
            ).then(() => {
                InvitationService.pushAndDeleteInvitation(
                    query.id,
                    recipeNames,
                );
            });
        } else {
            const {folder, ...modQuery} = query;
            return RecipeService.saveToUserShareRecipe(modQuery, folder).then(
                () => {
                    const recipeNames = modQuery.recipe_name;
                    InvitationService.pushAndDeleteInvitation(
                        query.id,
                        recipeNames,
                    );
                },
            );
        }
    }
}
