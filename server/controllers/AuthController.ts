import {GRANT, ROLE} from '@/acl/types';
import {ErrorCode, MessageCode} from '@/src/constants';
import {POST, SSR, USE, entity} from 'server/decorators';
import validate from 'server/middleware/validate';
import type {ActionProps} from '.';
import authTokenCheck from '../middleware/authTokenCheck';
import BaseController from './BaseController';
@entity('Identity')
export default class AuthController extends BaseController {
    @POST('api/login', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    @USE(
        validate({
            type: 'object',
            properties: {
                idToken: {type: 'string'},
                fcmToken: {type: 'string'},
            },
            required: ['idToken'],
            additionalProperties: false,
        }),
    )
    public async login({guard, query, fnMessage, fnError}: ActionProps) {
        const {Identity} = this.di;
        fnMessage(MessageCode.UserLogin);
        fnError(ErrorCode.LoginFailed);
        const res = await Identity.login(query.idToken);
        if (
            res?.identity?.userId != undefined &&
            query?.fcmToken != undefined
        ) {
            
            const {UserService} = this.di;
            await UserService.addFCMTokens(res.identity.userId, [query.fcmToken], true);
        }
        return Identity.cleanGuardIdentityWithAccesses(guard, res.identity);
        //return Identity.cleanGuardIdentity(guard, res.identity);
    }

    // @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                uid: {type: 'string'},
                email: {type: 'string'},
                firstName: {type: 'string'},
                lastName: {type: 'string'},
                timezone: {type: 'string'},
                role: {type: 'string'},
                language: {type: 'string'},
                currencySymbol: {type: 'string'},
                scale: {type: 'string'},
                authType: {type: 'string'},
                parentsId: {type: 'array'},
            },
            validateProperty: {
                role: 'role',
            },
            required: [
                'uid',
                'email',
                'firstName',
                'lastName',
                'timezone',
                'language',
                'scale',
                'authType',
            ],
            additionalProperties: false,
        }),
    )
    @POST('api/register', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public async register({guard, query, fnMessage, fnError}: ActionProps) {
        const {Identity} = this.di;
        fnMessage(MessageCode.UserRegister);
        fnError(ErrorCode.RegisterFailed);
        const res = await Identity.register(query);
        return Identity.cleanGuardIdentityWithAccesses(guard, res.identity);
    }

    @USE(authTokenCheck)
    @POST('api/autologin', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public async autologin({guard, identity, fnMessage, fnError}: ActionProps) {
        const {Identity} = this.di;
        fnMessage(MessageCode.UserLogin);
        fnError(ErrorCode.LoginFailed);
        const res = await Identity.autologin(identity);

        return Identity.cleanGuardIdentityWithAccesses(guard, res.identity);
        //return Identity.cleanGuardIdentity(guard, res.identity);
    }

    @USE(authTokenCheck)
    @POST('api/auth/update-identity', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public async updateIdentity({guard, identity, fnMessage, fnError}) {
        const roles = guard.getCleanRoles();
        const rules = guard.getCleanRules();

        fnMessage(MessageCode.IdentityUpdated);
        fnError(ErrorCode.IdentityUpdatingError);
        return {
            identity,
            roles,
            rules,
        };
    }

    @USE(authTokenCheck)
    @POST('api/auth/update-identity/expanded', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    public async updateIdentityExpanded({guard, identity, fnMessage, fnError}) {
        fnMessage(MessageCode.IdentityUpdated);
        fnError(ErrorCode.IdentityUpdatingError);
        const {Identity} = this.di;
        return Identity.cleanGuardIdentityWithAccesses(guard, identity);
    }

    // @USE(authTokenCheck)
    @SSR('/', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
            [ROLE.ROOT]: [GRANT.READ],
        },
        deny: {
            [ROLE.USER]: [GRANT.READ],
            [ROLE.OWNER]: [GRANT.READ],
        },
    })
    async getLogin() {
        return {};
    }
}
