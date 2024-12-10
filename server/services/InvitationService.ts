import BaseContext from 'server/di/BaseContext';
import {IInvitation} from '../models/Invitation';
import {DEFAULT_LANGUAGE_CODE, DEFAULT_TIMEZONE, ErrorCode, MessageCode} from '@/src/constants';
import i18next from 'i18next';
import {ROLE} from '@/acl/types';
const uuid = require('uuid');

export default class InvitationService extends BaseContext {
    /**
     * getAllInvitations
     */
    public getAllInvitations() {
        const {Invitations} = this.di;
        return Invitations.all();
    }

    /**
     * findInvitationInfo
     */
    public async findInvitationInfo(id: string) {
        const {Invitations} = this.di;
        const invitation = await Invitations.get(Invitations.id(id));
        if (invitation) {
            return {...invitation.data, id: invitation.ref.id};
        } else {
            throw new Error(ErrorCode.NotInvitationForId);
        }
    }

    /**
     * findInvitationForUser
     */
    public async findInvitationForUser(userId: string) {
        const {Invitations} = this.di;
        return (
            await Invitations.query($ => $.field('receiverUserId').eq(userId))
        ).map(value => {
            return {...value.data, id: value.ref.id};
        });
    }

    /**
     * findInvitationForEmail
     */
    public async findInvitationForEmail(email: string) {
        const {Invitations} = this.di;
        return (
            await Invitations.query($ => $.field('receiverEmail').eq(email))
        ).map(value => {
            return {...value.data, id: value.ref.id};
        });
    }

    /**
     * findInvitationInfoExpended
     */
    public async findInvitationInfoExpended(id: string) {
        const {Invitations, UserService, CategoryService} = this.di;
        const invitation = await Invitations.get(Invitations.id(id));
        if (invitation) {
            const data = invitation.data;
            const invitationId = invitation.ref.id;
            const receiverUserId = data.receiverUserId;
            let receiver = undefined;
            let categories = undefined;
            if (receiverUserId) {
                receiver = await UserService.findUserInfo(receiverUserId);
                categories = await CategoryService.getCategoriesUser(receiverUserId)
            }

            return {...data, receiver, categories, id: invitationId};
        } else {
            throw new Error(ErrorCode.NotInvitationForId);
        }
    }
    /**
     * addInvitation
     */
    public async addInvitation(data: IInvitation) {
        const {Invitations} = this.di;
        data.createdAt = data.createdAt ?? new Date().getTime();
        const res = await Invitations.add(data);
        return this.findInvitationInfo(res.id);
    }

    /**
     * addInvitationWithId
     */
    public async addInvitationWithId(id: string, data: IInvitation) {
        const {Invitations} = this.di;
        data.createdAt = data.createdAt ?? new Date().getTime();
        await Invitations.set(Invitations.id(id), data);
        return this.findInvitationInfo(id);
    }

    /**
     * updateInvitationAccessData
     */
    public async updateInvitationData(id: string, data: IInvitation) {
        const old = await this.findInvitationInfo(id);
        if (old) {
            return this.addInvitationWithId(id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NotInvitationForId);
        }
    }

    /**
     * deleteInvitation
     */
    public async deleteInvitation(id: string) {
        const {Invitations} = this.di;
        await Invitations.remove(Invitations.id(id));
        return {id, message: MessageCode.InvitationDeleted};
    }
    public async pushAndDeleteInvitation(id: string, recipeNames: string) {
        const invitation = await this.findInvitationInfo(id);
        if (invitation) {
            const {UserService} = this.di;
            UserService.sendCustomData([invitation.senderUserId], 'NOTIFICATION', {
                uuid: uuid.v4(),
                title: "invite-recipe-accept-title",
                message: "invite-recipe-accept-message",
                params: {
                    recipeNames: recipeNames
                },
                timestamp: Date.now()
            })
            this.deleteInvitation(id)
        }
        return {id, message: MessageCode.InvitationDeleted};
    }

    /**
     * createInvitation
     */
    public async createInvitation(data: IInvitation) {
        if(data?.receiverEmail) data.receiverEmail = data?.receiverEmail?.trim();
        if(data?.receiverFirstName) data.receiverFirstName = data?.receiverFirstName?.trim();
        if(data?.receiverLastName) data.receiverLastName = data?.receiverLastName?.trim();
        const invitation = await this.addInvitation(data);
        return await this.findInvitationInfo(invitation.id);
    }

    /**
     * sendInvitation
     */
    public async sendInvitation(
        senderId: string,
        {
            receiverFirstName,
            receiverLastName,
            receiverEmail,
            accessData,
            lng = DEFAULT_LANGUAGE_CODE,
        },
        fnError,
    ) {
        const {UserService, InvitationService, Mail, config} = this.di;
        const receiver = await UserService.findUserWithEmail(receiverEmail);
        const sender = await UserService.findUserInfo(senderId);
        let resultInvitation = undefined as IInvitation | undefined;
        let checkInvitation: any[] = [];
        if (receiver != null) {
            if (
                (receiver.parentsId != undefined &&
                    receiver.parentsId.length > 0) ||
                receiver.role == ROLE.OWNER ||
                receiver.role == ROLE.ROOT
            ) {
                fnError(ErrorCode.UserAlreadyExist);
                throw new Error(ErrorCode.UserAlreadyExist);
            } else {
                checkInvitation = await this.findInvitationForUser(
                    receiver.uid,
                );
            }
        } else {
            checkInvitation = await this.findInvitationForEmail(receiverEmail);
        }
        if (checkInvitation.length > 0) {
            resultInvitation = checkInvitation[0];
            if (resultInvitation.senderUserId != senderId) {
                console.log(5);
                fnError(ErrorCode.UserAlreadyHaveInvite);
                throw new Error(ErrorCode.UserAlreadyHaveInvite);
            }

            if (accessData != undefined && accessData.length > 0) {
                resultInvitation = await this.updateInvitationData(
                    resultInvitation.id,
                    {
                        ...resultInvitation,
                        accessData,
                    },
                );
            }
        } else {
            if (receiver != null) {
                resultInvitation = await this.createInvitation({
                    senderUserId: senderId,
                    accessData: accessData,
                    receiverUserId: receiver.uid,
                    senderTimeZone: sender.timezone ?? DEFAULT_TIMEZONE, 
                });
            } else {
                resultInvitation = await this.createInvitation({
                    senderUserId: senderId,
                    accessData: accessData,
                    receiverEmail,
                    receiverLastName,
                    receiverFirstName,
                    senderTimeZone: sender.timezone ?? DEFAULT_TIMEZONE,
                });
            }
        }
        if (resultInvitation == undefined) {
            console.log(6);
            fnError(ErrorCode.InviteSentFailed);
            throw new Error(ErrorCode.InviteSentFailed);
        }

        const link = `${config.baseUrl}/invitation/${resultInvitation.id}`;

        const message = i18next.t('invitation.message', {
            lng,
            name: sender.firstName + ' ' + sender.lastName,
            email: sender.email,
            link,
        });

        try {
            await Mail.send({
                template: 'invitation',
                to: receiverEmail,
                subject: i18next.t('invitation.subject', {lng}),
                title: i18next.t('invitation.title', {lng}),
                description: message,
                params: [],
            });
        } catch (error) {
            await this.deleteInvitation(resultInvitation.id);
            throw error;
        }

        return resultInvitation;
    }

    public async shareRecipe(
        senderId: string,
        {
            receiverFirstName,
            receiverLastName,
            receiverEmail,
            folder,
            accessData,
            lng = DEFAULT_LANGUAGE_CODE,
        },
        fnError,
    ) {
        const {UserService, InvitationService, Mail, config} = this.di;
        const receiver = await UserService.findUserWithEmail(receiverEmail);
        const sender = await UserService.findUserInfo(senderId);
        let resultInvitation = undefined as IInvitation | undefined;
        let checkInvitation: any[] = [];

        checkInvitation = await this.findInvitationForEmail(receiverEmail);


        if (checkInvitation.length > 0) {
            resultInvitation = checkInvitation[0];
            if (resultInvitation.senderUserId != senderId) {
                fnError(ErrorCode.UserAlreadyHaveInvite);
                throw new Error(ErrorCode.UserAlreadyHaveInvite);
            }

            if (accessData != undefined && accessData.length > 0) {
                resultInvitation = await this.updateInvitationData(
                    resultInvitation.id,
                    {
                        ...resultInvitation,
                        accessData,
                    },
                );
            }
        } else {
            if (receiver != null) {
                resultInvitation = await this.createInvitation({
                    senderUserId: senderId,
                    accessData: accessData,
                    receiverUserId: receiver.uid,
                    senderTimeZone: sender.timezone ?? DEFAULT_TIMEZONE, 
                });
            } else {
                resultInvitation = await this.createInvitation({
                    senderUserId: senderId,
                    accessData: accessData,
                    receiverEmail,
                    receiverLastName,
                    receiverFirstName,
                    senderTimeZone: sender.timezone ?? DEFAULT_TIMEZONE,
                });
            }
        }
        if (resultInvitation == undefined) {
            console.log(6);
            fnError(ErrorCode.InviteSentFailed);
            throw new Error(ErrorCode.InviteSentFailed);
        }

        const link = `${config.baseUrl}/invitation/recipe/${resultInvitation.id}`;

        const message = i18next.t('shareRecipe.message', {
            lng,
            name: sender.firstName + ' ' + sender.lastName,
            email: sender.email,
            link,
        });

        try {
            await Mail.send({
                template: 'invitation',
                to: receiverEmail,
                subject: i18next.t('shareRecipe.subject', {lng}),
                title: i18next.t('shareRecipe.title', {lng}),
                description: message,
                params: [],
            });
        } catch (error) {
            await this.deleteInvitation(resultInvitation.id);
            throw error;
        }

        return resultInvitation;
    }

    /**
     * invitationAcceptCompletion
     */
    public async invitationAcceptCompletion(id: string, userId: string, email:string) {
        const {UserService, MachineAccessService} = this.di;
        const invitation = await this.findInvitationInfo(id);
        const sender = await UserService.findUserInfo(invitation.senderUserId);
        let user;
        if(userId?.length > 0) {
            user = await UserService.findUserInfo(userId);
        } else {
            user = await UserService.findUserWithEmail(email);
        }
        if(user) userId = user.uid;
        const accessData = (invitation.accessData ?? []).map(value => {
            return {...value, userId};
        });
        await MachineAccessService.updateUserAccess(userId, accessData);

        await UserService.updateUserData(userId, {
            ...user,
            parentsId: [
                ...(sender?.parentsId ?? []),
                ...(sender?.uid ? [sender?.uid] : []),
            ],
        });

        await UserService.sendNotificationData([sender?.uid], {
            uuid: uuid.v4(),
            title: "invite-accept-title",
            message: "invite-accept-message",
            params: {
                userName: user.firstName + " " + user.lastName
            },
            timestamp: Date.now(),
            actionType: 'INVITE_ACCEPT'
        })

        await this.deleteInvitation(id);

        return {id, message: MessageCode.InvitationAccepted};
    }

    /**
     * rejectInvitation
     */
    public async rejectInvitation(invitationId: string) {
        return await this.deleteInvitation(invitationId);
    }
}
