import BaseContext from 'server/di/BaseContext';
import {IUser} from '../models/User';
import {IPagerParams} from '@/src/pagination/IPagerParams';
import {TypesaurusCore, TypesaurusQuery} from 'typesaurus';
import {
    DEFAULT_COUNTRY,
    DEFAULT_CURRENCY,
    DEFAULT_INVITATION_ROLE,
    DEFAULT_LANGUAGE_CODE,
    DEFAULT_ROLE,
    DEFAULT_SCALE,
    DEFAULT_SORT_DIR,
    DEFAULT_SORT_FIELD,
    DEFAULT_TIMEZONE,
    ErrorCode,
    MachineMessage,
    MessageCode,
    NotificationMessage,
    ResponseCode,
} from '@/src/constants';
import {auth, firestore} from 'firebase-admin';
import {firebaseErrors} from '@/src/utils/firebaseErrors';
import {AuthType, IIdentity, ROLE} from '@/acl/types';
import {PushCRUDData} from '@/src/entities/EntityTypes';
import Guard from '@/acl/Guard';

const uuid = require('uuid');

export default class UserService extends BaseContext {
    constructor(opts: any) {
        super(opts);
        this.sendEntityPush = this.sendEntityPush.bind(this);
        this.sendCustomData = this.sendCustomData.bind(this);
    }

    /**
     * getAllUsersInfo
     */
    public getAllUsersInfo() {
        const {Users} = this.di;

        return Users.all();
    }

    /**
     * findUserInfo
     */
    public async findUserInfo(userId: string) {
        const {Users, MachineAccessService} = this.di;
        const user = (await Users.get(Users.id(userId))).data;
        if (user) {
            return user;
        } else {
            throw new Error(ErrorCode.NoUserForId);
        }
    }

    public async getUserWithAccessesAndRelations(userId: string) {
        const {MachineAccessService} = this.di;
        const userWithAccess = await MachineAccessService.getUserWithAccess(userId);
        const userRelations = await this.findUserInfoWithRelations(userId);
        return {
            ...userWithAccess,
            relations: userRelations
        }
    }

    public async findUserInfoWithRelations(userId: string) {
        const {Users} = this.di;
        const user = await this.findUserInfo(userId);
        if(user?.role === ROLE.OWNER || user?.role === ROLE.ROOT) {
            const children = await Users.query($ =>
                $.field('parentsId').contains(user.uid),
            );
            return children.map(user => {
                return user.data;
            });
        }
        else if(user?.parentsId?.length) {
            let parents = await Promise.all(user.parentsId.map(parentId => this.findUserInfo(parentId)));
            return parents;
        }
    }

    /**
     * authByUsedId
     */
    public async authByUserId(userId: string) {
        const user = await this.findUserInfo(userId);

        const identity = {
            userId: user.uid,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            userEmail: user.email,
            secret: user.email.replaceAll('.', '@'),
            locale: user.language,
            timezone: user.country,
            languageCode: user.language,
            countryCode: user.country,
            scale: user.scale,
            authType: user.authType,
        };

        const {roles, rules, config} = this.di;
        const guard = new Guard(roles, rules);
        guard.build(identity);

        const {Identity} = this.di;
        const auth = await Identity.cleanGuardIdentityWithAccesses(
            guard,
            identity,
        );

        return auth;
    }

    /**
     * getRelatedUsersByMachineID
     */
    public async getRelatedUsersByMachineID(machineId: string) {
        const {Users, MachineAccessService} = this.di;
        const usersIds = (
            await MachineAccessService.getAccessesByMachineID(machineId)
        ).map(item => item.userId);
        if(usersIds.length) {
            const users = await Users.query($ => $.field('uid').in(usersIds));
            return users.map(user => ({...user.data, id: user.ref.id}));
        }
        return []
    }

    /**
     * findUserWithEmail
     */
    public async findUserWithEmail(email: string) {
        const {Users} = this.di;
        const users = await Users.query($ => $.field('email').eq(email));
        if (users.length > 0 && users[0]) {
            return users[0].data;
        } else {
            return null;
        }
    }

    public async getExistedUserByInvitation(invitationID: string) {
        const {InvitationService} = this.di;
        const invitation = await InvitationService.findInvitationInfo(
            invitationID,
        );

        if (invitation) {
            if (invitation.receiverEmail) {
                const user = this.findUserWithEmail(invitation.receiverEmail);
                if (user) {
                    return user;
                }
            } else if (invitation.receiverUserId) {
                const user = this.findUserInfo(invitation.receiverUserId);
                if (user) {
                    return user;
                }
            }
        }
        throw new Error(ErrorCode.NoUserForId);
    }

    /**
     * addUser
     */
    public addUser(data: IUser) {
        const {Users} = this.di;

        data.role = data.role ?? DEFAULT_ROLE;
        data.country = data.country ?? DEFAULT_COUNTRY;
        data.language = data.language ?? DEFAULT_LANGUAGE_CODE;
        data.scale = data.scale ?? DEFAULT_SCALE;
        data.authType = data.authType ?? AuthType.Default;
        data.currencySymbol = data.currencySymbol ?? DEFAULT_CURRENCY;
        data.firstName = data.firstName?.trim();
        data.lastName = data.lastName?.trim();
        data.email = data.email?.trim();

        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();

        return Users.add(data);
    }

    /**
     * addUserWithId
     */
    public addUserWithId(id: string, data: IUser) {
        const {Users} = this.di;

        data.role = data.role ?? DEFAULT_INVITATION_ROLE;
        data.country = data.country ?? DEFAULT_COUNTRY;
        data.timezone = data.timezone ?? DEFAULT_TIMEZONE;
        data.language = data.language ?? DEFAULT_LANGUAGE_CODE;
        data.scale = data.scale ?? DEFAULT_SCALE;
        data.authType = data.authType ?? AuthType.Default;
        data.currencySymbol = data.currencySymbol ?? DEFAULT_CURRENCY;
        data.firstName = data.firstName?.trim();
        data.lastName = data.lastName?.trim();
        data.email = data.email?.trim();

        data.createdAt = data.createdAt ?? new Date().getTime();
        data.updatedAt = data.updatedAt ?? new Date().getTime();

        return Users.set(Users.id(id), data);
    }

    /**
     * updateUserData
     */
    public async updateUserData(id: string, data: IUser) {
        const old = await this.findUserInfo(id);
        if (old) {
            return this.addUserWithId(id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NoUserForId);
        }
    }

    /**
     * page
     */
    public async page(pager: IPagerParams) {
        const {
            Users,
            firebase: {firestore},
        } = this.di;
        const {page, perPage, lastDocumentId} = pager;
        const filter = (
            helper: TypesaurusQuery.Helpers<
                TypesaurusCore.CollectionDef<
                    'users',
                    IUser,
                    false,
                    false,
                    false
                >
            >,
        ) => {
            return Object.keys(pager.filter ?? {}).map(key => {
                return helper.field(key as keyof IUser).eq(pager.filter![key]);
            });
        };
        let count = await Users.query($ => [...filter($)]).count();
        let sortField = DEFAULT_SORT_FIELD;
        if (pager.sort && pager.sort['field']) {
            sortField = pager.sort['field'];
        }

        let sortDirection = DEFAULT_SORT_DIR;
        if (pager.sort && pager.sort['dir']) {
            sortDirection = pager.sort['dir'];
        }

        let query = firestore
            .collection('users')
            .orderBy(sortField, sortDirection as any);
        Object.keys(pager.filter ?? {}).forEach(key => {
            query = query.where(key, '==', pager.filter![key]);
        });
        if (lastDocumentId) {
            const afterDocument = await firestore
                .collection('users')
                .doc(lastDocumentId)
                .get();
            query = query.startAfter(afterDocument);
        }

        const count2 = (await query.get()).docs.length;
        
        const items = await query.limit(perPage).get();
        const res = items.docs.map(item => {
            return item.data();
        });
        return {
            items: res,
            count,
        };
    }

    /**
     * deleteUser
     */
    public async deleteUser(
        id: string,
        fnError?: (message: any, code?: any, statusCode?: number) => void,
    ) {
        const {
            Users,
            Machines,
            MachineService,
            MachineAccessService,
            RecipeService,
        } = this.di;
        
        const user = await this.findUserInfo(id);
        const machines = await MachineService.getMachinesForUser(id);
        if (machines.length > 0) {
            fnError(
                ErrorCode.UserDeleteFailedOwnMachine,
                ResponseCode.ERROR,
                501,
            );
            throw new Error(ErrorCode.UserDeleteFailedOwnMachine);
        }
        await MachineAccessService.deleteAccessForUser(id);
        try {
            await auth().deleteUser(id);
        } catch (e) {
            if (
                e.errorInfo &&
                e.errorInfo.code == firebaseErrors.AUTH_USER_NOT_FOUND
            ) {
                console.log('delete not confirmed user');
            } else {
                throw new Error(e);
            }
        }
        const ref = firestore().collection('users').doc(id)
        await firestore().recursiveDelete(ref)
        if (user.parentsId != undefined && user.parentsId.length > 0) {
            const pushData: PushCRUDData = {
                entityName: 'UserEntity',
                actionType: 'DELETE',
                ids: [id],
            };
            this.sendEntityPush(user.parentsId, pushData);
        }
        return {uid: id, message: MessageCode.UserDeleted};
    }

    /**
     * getRelatedUsers
     */
    public async getRelatedUsers(identity: IIdentity) {
        const {
            Users,
            firebase: {firestore},
        } = this.di;
        let res: any[] = [];
        const users = await Users.query($ =>
            $.field('parentsId').contains(identity.userId),
        );
        res = users.map(user => {
            return user.data;
        });
        return res;
    }

    /**
     * createUserByInvitation
     */
    public async createUserByInvitation(
        firstName: string,
        lastName: string,
        email: string,
        senderId: string,
    ) {
        const {Users} = this.di;
        const sender = await Users.get(Users.id(senderId));
        let guid = uuid.v4();
        const invitationUser: IUser = {
            uid: guid,
            firstName,
            lastName,
            email,
            isInvitation: true,
            parentsId: [...(sender.data.parentsId ?? []), senderId],
        };

        const user = await this.addUser(invitationUser);
        const userId = user.id;
        await Users.update(Users.id(userId), {uid: userId});
        return await this.findUserInfo(userId);
    }

    /**
     * acceptInvite
     */
    public async acceptInvite(invitationId: string, registerData: IUser) {
        const {Identity, InvitationService, MachineAccessService} = this.di;
        const newUser = await Identity.register(registerData);
        await InvitationService.invitationAcceptCompletion(
            invitationId,
            newUser.identity.userId,
            newUser.identity.userEmail,
        );
        return await MachineAccessService.getUserWithAccess(
            newUser.identity.userId,
        );
    }
    /**
     * addNewUser
     */
    public async addNewUser(data: IUser) {
        const {Users} = this.di;
        await this.addUserWithId(data.uid, data);
        return await this.findUserInfo(data.uid);
    }

    public async isOwner(ownerId: string, userId: string) {
        const {Users} = this.di;
        const children = await Users.get(Users.id(userId));
        const parents = children.data.parentsId ?? [];
        return parents.includes(ownerId);
    }

    /**
     * changeParentForRelatedUsers
     */
    public async changeParentForRelatedUsers(
        oldUserID: string,
        newParentID: string,
    ) {
        const {Users} = this.di;

        const users = await Users.query($ =>
            $.field('parentsId').contains(oldUserID),
        );
        const updatePromises = users.map(async user => {
            const parentsId = user.data.parentsId;
            if (parentsId && parentsId.includes(oldUserID)) {
                const userIdIndex = parentsId.indexOf(oldUserID);

                if (user.data.uid === newParentID) {
                    // remove id of current user from parents of new owner
                    parentsId.splice(userIdIndex, 1);
                } else {
                    parentsId[userIdIndex] = newParentID;
                }
                await Users.update(user.ref.id, {parentsId});
            }

            return user.data;
        });

        return Promise.all(updatePromises);
    }

    /**
     * transferAllRights
     */
    public async transferAllRights(oldUserID: string, newUserID: string) {
        const {MachineService, MachineAccessService, MachineGroupService, UserService} =
            this.di;

        // // change parents of related users
        await this.changeParentForRelatedUsers(oldUserID, newUserID);

        // // change user role if he is user and clear parentsId
        const newOwner = await this.findUserInfo(newUserID);
        if (newOwner.role === ROLE.USER) {
            await this.updateUserData(newUserID, {
                role: ROLE.OWNER,
                parentsId: [],
            } as any);
        } else {
            await this.updateUserData(newUserID, {parentsId: []} as any);
        }

        // change old owner role to user
        await this.updateUserData(oldUserID, {role: ROLE.USER} as any);

        // // change owner of machines
        await MachineService.changeUserMachinesOwnerOnNew(oldUserID, newUserID);

        // // change in machine access
        await MachineAccessService.changeUserIDInAccessList(
            oldUserID,
            newUserID,
        );

        // change in machine groups
        await MachineGroupService.changeUserIDInGroups(oldUserID, newUserID);
        const oldUser = await UserService.findUserInfo(oldUserID)
        await UserService.sendNotificationData([newUserID], {
            uuid: uuid.v4(),
            title: "transfer-rights-title",
            message: "transfer-rights-message",
            params: {
                userName: oldUser.firstName + " " + oldUser.lastName
            },
            timestamp: Date.now(),
            actionType: 'TRANSFER_RIGHTS',
        });
    }

    /**
     * addFCMTokens
     */
    public async addFCMTokens(userId: string, tokens: string[], checkExpire: boolean = false) {
        const user = await this.findUserInfo(userId);

        const now = new Date().getTime();

        let newTokens = [...(user.fcmTokens ?? [])];

        for (let i = 0; i < tokens.length; i++) {
            const element = tokens[i];

            const index = newTokens.findIndex(value => {
                return value.token == element;
            });

            if (index == -1) {
                newTokens.push({token: element, lastUpdateTime: now});
            } else {
                newTokens[index].lastUpdateTime = now;
            }
        }

        if (checkExpire) {
            const now = Date.now();
            newTokens = newTokens.filter(token => {
                return (
                    now - token.lastUpdateTime <
                    (this.di.config.fcmTokenExpireTime ??
                        30 * 24 * 60 * 60 * 1000)
                );
            });
        }

        return await this.updateUserData(userId, {
            ...user,
            fcmTokens: newTokens,
        });
    }

    /**
     * removeFCMTokens
     */
    public async removeFCMTokens(
        userId: string,
        tokens: string[],
        checkExpire: boolean = false,
    ) {
        const user = await this.findUserInfo(userId);

        const existedTokens = user.fcmTokens ?? [];

        let newTokens = existedTokens.filter(value => {
            return !tokens.includes(value.token);
        });

        if (checkExpire) {
            const now = Date.now();
            newTokens = newTokens.filter(token => {
                return (
                    now - token.lastUpdateTime <
                    (this.di.config.fcmTokenExpireTime ??
                        30 * 24 * 60 * 60 * 1000)
                );
            });
        }

        return await this.updateUserData(userId, {
            ...user,
            fcmTokens: newTokens,
        });
    }

    /**
     * checkFCMTokens
     */
    public async checkFCMTokens(userId: string) {
        const user = await this.findUserInfo(userId);
        let tokens = user.fcmTokens ?? [];
        const now = Date.now();
        tokens = tokens.filter(token => {
            return (
                now - token.lastUpdateTime <
                (this.di.config.fcmTokenExpireTime ?? 30 * 24 * 60 * 60 * 1000)
            );
        });
        return await this.updateUserData(userId, {
            ...user,
            fcmTokens: tokens,
        });
    }

    /**
     * clearFCMTokens
     */
    public async clearFCMTokens(userId: string) {
        const user = await this.findUserInfo(userId);
        return await this.updateUserData(userId, {
            ...user,
            fcmTokens: [],
        });
    }

    /**
     * sendEntityPush
     */
    public async sendEntityPush(
        userIds: string[],
        pushData: PushCRUDData,
        excludedFCM: string[] = [],
    ) {
        await this.sendPushToUsers(
            userIds,
            {
                data: {
                    type: 'ENTITY_ACTION',
                    payload: JSON.stringify(pushData),
                },
            },
            excludedFCM,
        );
    }

    /**
     * sendNotificationData
     */
    public async sendNotificationData(
        userIds: string[],
        notification: NotificationMessage | MachineMessage,
        excludedFCM: string[] = [],
    ) {
        await this.sendCustomData(
            userIds,
            'NOTIFICATION',
            notification,
            excludedFCM,
        );
    }

    /**
     * sendCustomData
     */
    public async sendCustomData(
        userIds: string[],
        type: string,
        payload: any,
        excludedFCM: string[] = [],
    ) {
        await this.sendPushToUsers(
            userIds,
            {
                data: {
                    type,
                    payload:
                        typeof payload == 'string'
                            ? payload
                            : JSON.stringify(payload),
                },
            },
            excludedFCM,
        );
    }

    /**
     * sendPushToUsers
     */
    public async sendPushToUsers(
        userIds: string[],
        message: {
            data?: {
                [key: string]: string;
            };
            notification?: {
                title?: string;
                body?: string;
            };
        },
        excludedFCM: string[] = [],
    ) {
        const {Users} = this.di;
        const ids = [...userIds];
        const {
            firebase: {messaging},
        } = this.di;

        let resUsers: IUser[] = [];
        if (ids.length > 0) {
            while (ids.length) {
                const batch = ids.splice(0, 30);
                const users = await Users.query($ => $.field('uid').in(batch));
                resUsers.push(
                    ...users.map(user => {
                        return {...user.data, uid: user.ref.id};
                    }),
                );
            }
        }

        let tokens: string[] = [];
        for (let i = 0; i < resUsers.length; i++) {
            const user = resUsers[i];
            tokens.push(...user.fcmTokens.map(value => value.token));
        }
        tokens = Array.from(new Set(tokens));

        tokens = tokens.filter(value => {
            return value != undefined && !excludedFCM.includes(value);
        });
        const priority = 'high' as const;
        const multicastMessage = {
            ...message,
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                    },
                },
                headers: {
                    'apns-push-type': 'background',
                    'apns-priority': '5',
                    'apns-topic': 'com.dehydratormobile', // your app bundle identifier
                },
            },
            android: {
                priority,
            },
            tokens,
        };
        if (tokens.length > 0) messaging.sendEachForMulticast(multicastMessage);
    }
}
