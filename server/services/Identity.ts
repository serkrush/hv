import {
    DEFAULT_ROLE,
    ErrorCode,
    PushCommandType,
    ResponseCode,
    TOKEN_EXPIRE_TIME,
} from '@/src/constants';
import BaseContext from '../di/BaseContext';
import {IUser} from '../models/User';
import {generate, verify} from '../utils/token';
import {AuthType, GRANT, IIdentity, ROLE} from '@/acl/types';
import Guard from '@/acl/Guard';
import grantsForPermissionLevel from '../utils/grantsForPermissionLevel';

export default class Identity extends BaseContext {
    /**
     * cleanGuardIdentity
     */
    public cleanGuardIdentity(guard: Guard, identity: IIdentity) {
        guard.build(identity);
        const roles = guard.getCleanRoles();
        const rules = guard.getCleanRules();
        return {
            identity,
            roles,
            rules,
        };
    }

    /**
     * cleanGuardIdentityWithAccesses
     */
    public async cleanGuardIdentityWithAccesses(
        guard: Guard,
        identity: IIdentity,
    ) {
        guard.build(identity);
        const roles = guard.getCleanRoles();
        const rules = guard.getCleanRules();

        const {MachineAccessService, MachineService, MachineGroupService} =
            this.di;

        const accessData = await MachineAccessService.getExpandedAccessForUser(
            identity.userId,
            false,
        );

        const ownedMachine = await MachineService.getMachinesForUser(
            identity.userId,
        );

        const ownedGroups = await MachineGroupService.getMachineGroupsForUser(
            identity.userId,
        );

        accessData.expandedMachinesAccess.forEach(element => {
            const resourceId = `machine_${element.machineId}`;
            const isOwner =
                ownedMachine.findIndex(
                    value => value.id == element.machineId,
                ) != -1;

            rules[resourceId] = {
                allow: {
                    [ROLE.USER]: grantsForPermissionLevel(
                        element.permissionLevel,
                        isOwner,
                    ),
                },
            };
        });

        accessData.groupsAccess.forEach(element => {
            const resourceId = `group_${element.machineGroupId}`;
            const isOwner =
                ownedGroups.findIndex(
                    value => value.id == element.machineGroupId,
                ) != -1;

            rules[resourceId] = {
                allow: {
                    [ROLE.USER]: grantsForPermissionLevel(
                        element.permissionLevel,
                        isOwner,
                    ),
                },
            };
        });

        return {
            identity,
            roles,
            rules,
        };
    }

    /**
     * register
     */
    public async register(registerData: IUser) {
        const {UserService} = this.di;
        await UserService.addUserWithId(registerData.uid, registerData);
        const user = await UserService.findUserInfo(registerData.uid);
        if (user != undefined) {
            const token = generate({uid: user.uid}, TOKEN_EXPIRE_TIME);
            const identity: IIdentity = {
                token: token,
                userId: user.uid,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                userEmail: user.email,
                secret: user.email.replaceAll('.', '@'),
                locale: user.language,
                timezone: user.timezone,
                languageCode: user.language,
                countryCode: user.country,
                scale: user.scale,
                authType: user.authType,
            };
            return {identity};
        } else {
            throw new Error(ErrorCode.NoUserForId);
        }
    }

    /**
     * login
     */
    public async login(idToken) {
        const {auth} = this.di.firebase;
        const res = await auth.verifyIdToken(idToken);
        if (res.email) {
            const email = res.email;
            const {UserService} = this.di;
            const user = await UserService.findUserWithEmail(email);

            if (user != null) {
                const token = generate({uid: user.uid}, TOKEN_EXPIRE_TIME);
                const identity: IIdentity = {
                    token: token,
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
                    authType: user?.authType ?? AuthType.Default
                };
                return {identity};
            } else {
                throw new Error(ErrorCode.NoUserForId);
            }
        }
    }

    /**
     * autologin
     */
    public async autologin(identity: IIdentity) {
        try {
            if (identity != null) {
                const token = generate(
                    {uid: identity.userId},
                    TOKEN_EXPIRE_TIME,
                );
                const updated: IIdentity = {
                    ...identity,
                    authType: identity?.authType ?? AuthType.Default,
                    token: token,
                };
                return {identity: updated};
            } else {
                throw new Error(ErrorCode.NoUserForId);
            }
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }

    /**
     * updatePassword
     */
    public async updatePassword(uid: string, password: string) {
        const {
            UserService,
            firebase: {auth},
        } = this.di;

        const user = await UserService.findUserInfo(uid);
        password = password?.trim();
        if (!user.isInvitation) {
            await auth.updateUser(uid, {password});
        }
        return await UserService.findUserInfo(uid);
    }

    /**
     * updateUserInfo
     */
    public async updateUserInfo(uid: string, updatedData: IUser, fnError) {
        const {
            UserService,
            MachineService,
            firebase: {auth, messaging},
        } = this.di;

        const user = await UserService.findUserInfo(uid);
        if (!user.isInvitation) {
            try {
                await auth.updateUser(updatedData.uid, {
                    email: updatedData.email,
                    displayName:
                        updatedData.firstName?.trim() + ' ' + updatedData.lastName?.trim(),
                });
            } catch (e) {
                if (e.code) {
                    fnError(e.code);
                }

                throw new Error(e);
            }
        }
        await UserService.updateUserData(uid, {
            ...updatedData,
            updatedAt: new Date().getTime(),
        });
        const machines = await MachineService.getMachinesForUser(uid)
        let tokens = machines.map((value) => {return value.fcmToken})
        tokens = tokens.filter(value => {
            return value != undefined;
        });
        const message = {
            data: {
                type: PushCommandType.UPDATE_IDENTITY,
            },
            tokens,
        };
        console.log('message', message);
        if (tokens.length > 0) messaging.sendEachForMulticast(message);
        return await UserService.findUserInfo(uid);
    }
}
