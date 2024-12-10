import BaseController from './BaseController';
import {GET, POST, SSR, USE, pager} from 'server/decorators';
import validate, {validateProps} from 'server/middleware/validate';
import entity from 'server/decorators/entity';
import {
    DEFAULT_PER_PAGE,
    DEFAULT_SORT_DIR,
    DEFAULT_SORT_FIELD,
    ErrorCode,
    MessageCode,
} from '@/src/constants';
import authTokenCheck from '../middleware/authTokenCheck';
import {AuthType, GRANT, ROLE} from '@/acl/types';
import type {ActionProps} from '.';

@entity('UserEntity')
export default class UserController extends BaseController {
    @USE(authTokenCheck)
    @SSR('/home', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async getHome() {
        return {};
    }

    @USE(authTokenCheck)
    @SSR('/home/users/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
        // deny: {
        //   [ROLE.ROOT]: [GRANT.READ],
        // }
    })
    async getAddUser() {
        return {};
    }

    @pager()
    @USE(authTokenCheck)
    @SSR('/home/users', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async getProductsPaginatedSSR({
        query,
        pager,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {UserService} = this.di;
        pager.filter = {};
        // pager.force = true
        pager.perPage = DEFAULT_PER_PAGE;
        pager.entityName = 'users';
        pager.pageName = 'users';
        pager.sort = {
            field: query['s'] ?? DEFAULT_SORT_FIELD,
            dir: query['sd'] ?? DEFAULT_SORT_DIR,
        };
        fnMessage('user page fetched success');
        fnError('Can not fetch user page info');
        return UserService.page(pager);
    }

    @pager()
    @USE(authTokenCheck)
    @POST('api/users/page', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async getUsersPaginated({pager, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        fnMessage('user page fetched success');
        fnError('Can not fetch user page info');
        return UserService.page(pager);
    }

    /**
     * get
     */

    // @USE(authTokenCheck)
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
    @USE(authTokenCheck)
    @GET('api/users/:id', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @SSR('/home/users/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
        // deny: {
        //   [ROLE.ROOT]: [GRANT.READ],
        // },
    })
    public get({query, fnMessage, fnError}: ActionProps) {
        const id = query['id'] as string;
        const {UserService} = this.di;
        fnMessage('user info fetched success');
        fnError('Can not fetch user info');
        return UserService.getUserWithAccessesAndRelations(id);
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
    @GET('api/users/invitation/:id', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public getUserByEmail({query, fnMessage, fnError}: ActionProps) {
        const id = query['id'] as string;
        const {UserService} = this.di;
        fnMessage('user info fetched success');
        fnError('Can not fetch user info');
        return UserService.getExistedUserByInvitation(id);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: validateProps.user,
            },
            required: ['id', 'data'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/:id/update/data', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async update({query, fnMessage, fnError}: ActionProps) {
        const {Identity} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage('user updated success');
        fnError('Can not update user info');
        return Identity.updateUserInfo(id, data, fnError);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: validateProps.password,
            },
            required: ['id', 'data'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/:id/update/password', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async updatePassword({query, fnMessage, fnError}: ActionProps) {
        const {Identity} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage('user updated success');
        fnError('Can not update user password');
        return Identity.updatePassword(id, data);
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
    @POST('api/users/:id/delete', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
            [ROLE.ROOT]: [GRANT.EXECUTE],
        },
    })
    async delete({query, identity, fnMessage, fnError, guard}: ActionProps) {
        const {UserService} = this.di;
        const id = query['id'] as string;
        fnMessage('user deleted success');
        fnError('Can not delete user');
        const isOwner = await UserService.isOwner(identity.userId, id);
        if (identity.userId == id || guard.allow(GRANT.EXECUTE) || isOwner) {
            return UserService.deleteUser(id, fnError);
        } else {
            throw new Error(ErrorCode.NotAccessedAction);
        }
    }

    @USE(authTokenCheck)
    @GET('api/users/related', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getRelatedUser({query, identity, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        fnMessage('users data received success');
        fnError('Can not receive users data');
        return UserService.getRelatedUsers(identity);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: {type: 'array', items: validateProps.machineAccess},
            },
            required: ['id', 'data'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/:id/access/update', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async updatePermissions({query, identity, fnMessage, fnError}: ActionProps) {
        const {MachineAccessService} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage('user permissions updated success');
        fnError('Can not update user permissions');
        return MachineAccessService.updateUserAccess(id, data, true, identity);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                machineId: {type: 'string'},
            },
            required: ['id'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/:id/access/delete', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async deletePermissions({query, fnMessage, fnError}: ActionProps) {
        const {MachineAccessService} = this.di;
        const id = query['id'] as string;
        const machineId = query['machineId'];

        fnMessage('user permissions deleted success');
        fnError('Can not delete user permissions');
        if (machineId != undefined) {
            return MachineAccessService.deleteUserAccessForMachine(
                id,
                machineId,
            );
        } else {
            return MachineAccessService.deleteAccessForUser(id);
        }
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
    @POST('api/users/:id/detailed', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async getUserDetailed({query, fnMessage, fnError}: ActionProps) {
        const {MachineAccessService} = this.di;
        const id = query['id'] as string;
        fnMessage('user data received success');
        fnError('Can not receive user data');
        return MachineAccessService.getUserWithAccess(id);
    }

    @USE(authTokenCheck)
    @POST('api/users/detailed', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async getCurrentUserDetailed({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineAccessService} = this.di;
        fnMessage('user data received success');
        fnError('Can not receive user data');
        return MachineAccessService.getUserWithAccess(identity.userId);
    }

    @USE(authTokenCheck)
    @POST('api/users/add', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async addUser({query, identity, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        fnMessage(MessageCode.UserRegister);
        fnError(ErrorCode.RegisterFailed);
        return UserService.addNewUser(query);
    }

    /**
     *  transferAllRights
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                newUser: validateProps.queryId,
            },
            required: ['newUser'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/transfer', {
        allow: {
            [ROLE.OWNER]: [GRANT.READ],
        },
    })
    async transferAllRights({
        identity,
        query,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {UserService} = this.di;
        const newUser = query['newUser'] as string;
        const currentUser = identity.userId;
        fnMessage(MessageCode.UserTransferRights);
        fnError(ErrorCode.UserTransferRightsFailed);
        return UserService.transferAllRights(currentUser, newUser);
    }

    @USE(
        validate({
            type: 'object',
            properties: {
                email: validateProps.email,
            },
            required: ['email'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/email', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async isEmailExist({identity, query, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        const email = query['email'] as string;
        const user = await UserService.findUserWithEmail(email);
        fnMessage('email is exist');
        fnError('email isn`t exist');
        return {
            isEmailExist: user ? true : false,
            authType: user.authType ?? AuthType.Default,
        };
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
    @GET('api/users/machines/:id/accesses', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @SSR('/home/machines/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getRelatedUsersByMachineID({
        query,
        fnMessage,
        fnError,
    }: ActionProps) {
        const id = query['id'] as string;
        const {UserService} = this.di;
        fnMessage('users data received success');
        fnError('Can not receive users data');
        return UserService.getRelatedUsersByMachineID(id);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                tokens: {
                    type: 'array',
                    items: {type: 'string'},
                },
            },
            required: ['tokens'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/fcm/add', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async addFcmTokens({query, identity, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        const {tokens} = query;
        fnMessage(MessageCode.FCMAdded);
        fnError(ErrorCode.FCMAddFailed);
        return UserService.addFCMTokens(identity.userId, tokens);
    }

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                tokens: {
                    type: 'array',
                    items: {type: 'string'},
                },
            },
            required: ['tokens'],
            additionalProperties: false,
        }),
    )
    @POST('api/users/fcm/remove', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async removeFcmTokens({query, identity, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        const {tokens} = query;
        fnMessage(MessageCode.FCMRemoved);
        fnError(ErrorCode.FCMRemoveFailed);
        return UserService.removeFCMTokens(identity.userId, tokens, true);
    }

    @USE(authTokenCheck)
    @POST('api/users/fcm/clear', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async clearFcmTokens({query, identity, fnMessage, fnError}: ActionProps) {
        const {UserService} = this.di;
        fnMessage(MessageCode.FCMRemoved);
        fnError(ErrorCode.FCMRemoveFailed);
        return UserService.clearFCMTokens(identity.userId);
    }
}
