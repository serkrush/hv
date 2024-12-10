import BaseController from './BaseController';
import {GET, pager, POST, SSR, USE} from 'server/decorators';
import validate, {validateProps} from 'server/middleware/validate';
import entity from 'server/decorators/entity';
import authTokenCheck from '../middleware/authTokenCheck';
import type {ActionProps} from '.';
import {
    DEFAULT_PER_PAGE,
    ENTITY,
    ErrorCode,
    MachinePairRequestResult,
    MachineResetRequestResult,
    MessageCode,
    ResponseCode,
    SHORT_GUID_LENGTH,
    languages,
    scales,
} from '@/src/constants';
import {GRANT, ROLE} from '@/acl/types';
import {IMachine, MachineType, ZoneInfo} from '../models/Machine';
import {enumFromStringValue} from '@/src/utils/enumFromStringValue';
import {Zone} from '../models/MachineModel';
import {PushCRUDData, zones} from '@/src/entities/EntityTypes';
import {generateMachineToken} from '../utils/token';

@entity('MachineEntity')
export default class MachineController extends BaseController {
    @USE(authTokenCheck)
    @pager()
    @SSR('/home/machines', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getMachinesPaginatedSSR({pager, fnMessage, fnError}) {
        const {MachineService} = this.di;
        pager.filter = {};
        pager.perPage = DEFAULT_PER_PAGE;
        pager.entityName = 'machines';
        pager.pageName = 'machines';
        fnMessage('success-machines-info');
        fnError('error-machines-info');
        return MachineService.page(pager);
    }

    @pager()
    @USE(authTokenCheck)
    @POST('api/machines/page', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
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
                lastDocumentId: {type: ['string', 'null']},
            },
            required: [],
            additionalProperties: false,
        }),
    )
    async getMachinesPaginated({pager, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        fnMessage('success-machines-info');
        fnError('error-machines-info');
        return MachineService.page(pager);
    }
    /**
     * findForUser
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                ids: {type: 'array', items: {type: 'string'}},
            },
            additionalProperties: false,
        }),
    )
    @POST('api/machines', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async findForUser({query, identity, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        const {ids} = query;
        fnMessage(MessageCode.MachinesReceived);
        fnError(ErrorCode.MachinesReceiveFailed);
        if (ids != undefined && ids.length > 0) {
            return MachineService.findByIds(ids, true, identity.userId);
        } else {
            return MachineService.getMachinesForUser(identity.userId);
        }
    }

    /**
     * add
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: validateProps.machine,
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/add', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async add({query, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        const data = query['data'];
        fnMessage(MessageCode.MachineAdded);
        fnError(ErrorCode.MachineAddFailed);
        return MachineService.addMachine(data);
    }

    /**
     * find
     */
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
    @GET('api/machines/:id', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @SSR('/home/machines/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public find({query, fnMessage, fnError}: ActionProps) {
        const id = query['id'] as string;
        const {MachineService} = this.di;
        fnMessage(MessageCode.MachineInfoFetched);
        fnError(ErrorCode.MachineFetchFailed);
        return MachineService.findMachineInfo(id);
    }

    /**
     * update
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: validateProps.machine,
            },
            required: ['id', 'data'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/:id/update', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async update({query, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage(MessageCode.MachineUpdated, ResponseCode.TOAST);
        fnError(ErrorCode.MachineUpdateFailed, ResponseCode.TOAST);
        return MachineService.updateMachineData(id, data);
    }

    /**
     * update
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                settings: validateProps.machineSettings,
            },
            required: ['id', 'settings'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/:id/settings/update', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async updateSettings({query, fnMessage, fnError}: ActionProps) {
        const {MachineService, UserService, MachineAccessService} = this.di;
        const id = query['id'] as string;
        const {settings} = query;
        fnMessage(MessageCode.MachineUpdated, ResponseCode.TOAST);
        fnError(ErrorCode.MachineUpdateFailed, ResponseCode.TOAST);
        const res = await MachineService.updateMachineSettings(id, settings);
        const userIds = await MachineAccessService.getMachineRelatedUsers(
            id,
            true,
        );

        const pushData: PushCRUDData = {
            entityName: 'MachineEntity',
            actionType: 'UPDATE',
            ids: [id],
        };
        await UserService.sendEntityPush(userIds, pushData);
        return res;
    }

    /**
     * delete
     */
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
    @POST('api/machines/:id/delete', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async delete({query, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        const id = query['id'] as string;
        fnMessage(MessageCode.MachineDeleted);
        fnError(ErrorCode.MachineDeleteFailed);
        return MachineService.deleteMachine(id);
    }

    /**
     * pairMachine
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                machineData: validateProps.machinePairData,
                connectionId: {type: 'string'},
            },
            required: ['machineData', 'connectionId'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/pair', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async pairMachine({
        query,
        identity,
        guard,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService, Identity} = this.di;
        const {machineData, connectionId} = query;
        fnMessage(MessageCode.MachinePaired);
        fnError(ErrorCode.MachinePairFailed);
        const existedMachine = await MachineService.findMachineByGuidIfExist(
            machineData.uid,
        );
        if (
            existedMachine != undefined &&
            existedMachine.ownerId != identity.userId
        ) {
            return {
                result: MachinePairRequestResult.NotOwner,
            };
        } else {
            const {UserService} = this.di;

            const owner = await UserService.findUserInfo(identity.userId);
            let actualIdentity = identity;
            let actualGuard = guard;
            if (
                owner &&
                owner.role == ROLE.USER &&
                (owner.parentsId == undefined || owner.parentsId.length == 0)
            ) {
                await UserService.updateUserData(identity.userId, {
                    ...owner,
                    role: ROLE.OWNER,
                });
                owner.role = ROLE.OWNER;

                actualIdentity = {
                    userId: owner.uid,
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                    role: owner.role,
                    userEmail: owner.email,
                    secret: owner.email.replaceAll('.', '@'),
                    locale: owner.language,
                    timezone: owner.country,
                    languageCode: owner.language,
                    countryCode: owner.country,
                    scale: owner.scale,
                    authType: owner.authType,
                };
                actualGuard.build(actualIdentity);
            }

            const cleanedGuardIdentity = Identity.cleanGuardIdentity(
                actualGuard,
                actualIdentity,
            );
            cleanedGuardIdentity.identity.token = generateMachineToken({
                mid: machineData.uid,
            });

            return {result: MachinePairRequestResult.Requested};
        }
    }

    /**
     * confirmPair
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                machineData: validateProps.machinePairDeviceData,
                connectionId: {type: 'string'},
                userId: {type: 'string'},
                fcmToken: {type: 'string'},
            },
            required: ['machineData', 'connectionId', 'userId'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/pair/confirm', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async confirmPair({
        query,
        identity,
        guard,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {connectionId, machineData, userId, fcmToken} = query;
        const {MachineService, MachineModelService, UserService} =
            this.di;

        let existedMachine = await MachineService.findMachineByGuidIfExist(
            machineData.uid,
        );

        const modelInfo = await MachineModelService.findModelInfo(
            (machineData.model as string).toLowerCase(),
        );

        const updateMachineData: IMachine = {
            guid: machineData.uid,
            shortGuid: machineData?.uid?.toString().slice(SHORT_GUID_LENGTH),
            modelId: modelInfo.id,
            machineName: existedMachine?.machineName ?? modelInfo.machineType,
            fcmToken,
            machineType:
                enumFromStringValue(MachineType, modelInfo.machineType) ??
                existedMachine?.machineType ??
                MachineType.Dehydrator,
            costPerKwh: existedMachine?.costPerKwh ?? 0,
            country: machineData.country ?? existedMachine?.country ?? '',
            language: machineData.language ?? existedMachine?.language ?? '',
            currencySymbol: machineData.currencySymbol ?? existedMachine?.currencySymbol ?? '',
            scale: machineData.scale ?? existedMachine?.scale ?? '',
            timezone: machineData.timezone ?? existedMachine?.timezone ?? '',
            categories: existedMachine?.categories ?? [],
            fanSpeed: machineData.fanSpeed ?? existedMachine?.fanSpeed ?? '',
            weightScaleFeature:
                machineData.weightScaleFeature ??
                existedMachine?.weightScaleFeature ??
                '',
            heatingIntensity:
                machineData.heatingIntensity ??
                existedMachine?.heatingIntensity ??
                '',
            zones:
                machineData.zones.map(zone => {
                    const actualZone = zones.find(element => {
                        return Zone[element].valueOf() == zone.zoneName;
                    });
                    const res: ZoneInfo = {
                        zone: Zone[actualZone],
                        zoneNumber: zone.zoneNumber,
                    };

                    return res;
                }) ?? existedMachine?.zones,
        };
        let actualIdentity = identity;
        let actualGuard = guard;
        let needResendIdentity = false;
        let access = undefined;
        const owner = await UserService.findUserInfo(userId);
        if (
            owner &&
            owner.role == ROLE.USER &&
            (owner.parentsId == undefined || owner.parentsId.length == 0)
        ) {
            await UserService.updateUserData(userId, {
                ...owner,
                role: ROLE.OWNER,
            });
            owner.role = ROLE.OWNER;
            needResendIdentity = true;

            actualIdentity = {
                userId: owner.uid,
                firstName: owner.firstName,
                lastName: owner.lastName,
                role: owner.role,
                userEmail: owner.email,
                secret: owner.email.replaceAll('.', '@'),
                locale: owner.language,
                timezone: owner.country,
                languageCode: owner.language,
                countryCode: owner.country,
                scale: owner.scale,
                authType: owner.authType,
            };
            actualGuard.build(actualIdentity);
        }

        if (existedMachine == undefined) {
            const pairRes = await MachineService.pairDehydrator(
                updateMachineData,
                userId,
            );
            existedMachine = pairRes.machine;
            access = pairRes.access;

            actualIdentity = {
                userId: owner.uid,
                firstName: owner.firstName,
                lastName: owner.lastName,
                role: owner.role,
                userEmail: owner.email,
                secret: owner.email.replaceAll('.', '@'),
                locale: owner.language,
                timezone: owner.country,
                languageCode: owner.language,
                countryCode: owner.country,
                scale: owner.scale,
                authType: owner.authType,
            };
            actualGuard.build(actualIdentity);
        } else {
            existedMachine = await MachineService.updateMachineData(
                existedMachine.id,
                updateMachineData,
            );
        }

        const {Identity} = this.di;
        const auth = await Identity.cleanGuardIdentityWithAccesses(
            actualGuard,
            actualIdentity,
        );

        if (needResendIdentity) {
            let cleanedGuardIdentity = {...auth};
            cleanedGuardIdentity.identity.token = generateMachineToken({
                mid: machineData.uid,
            });

        }

        fnMessage(MessageCode.MachinePairConfirmed);
        fnError(ErrorCode.MachinePairConfirmFailed);
        return existedMachine; //{ message: "all-ok" };
    }

    /**
     * resetMachine
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                machineGuid: {type: 'string'},
                connectionId: {type: 'string'},
            },
            required: ['machineGuid', 'connectionId'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/reset', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async resetMachine({
        query,
        identity,
        guard,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService, Identity} = this.di;
        const {machineGuid, connectionId} = query;
        fnMessage(MessageCode.MachinePaired);
        fnError(ErrorCode.MachinePairFailed);
        const existedMachine = await MachineService.findMachineByGuidIfExist(
            machineGuid,
        );
        if (existedMachine == undefined) {
            return {
                result: MachineResetRequestResult.NotExist,
            };
        } else if (existedMachine.ownerId != identity.userId) {
            return {
                result: MachineResetRequestResult.NotOwner,
            };
        }

        if (
            existedMachine != undefined &&
            existedMachine.ownerId != identity.userId
        ) {
            return {
                result: MachinePairRequestResult.NotOwner,
            };
        } else {
            return {result: MachinePairRequestResult.Requested};
        }
    }

    /**
     * confirmReset
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                connectionId: {type: 'string'},
                machineGuid: {type: 'string'},
            },
            required: ['machineGuid', 'connectionId'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/reset/confirm', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async confirmReset({
        query,
        identity,
        guard,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {connectionId, machineGuid} = query;
        const {MachineService} = this.di;

        let existedMachine = await MachineService.findMachineByGuidIfExist(
            machineGuid,
        );
        const id = existedMachine.id;
        await MachineService.deleteMachine(id);

        fnMessage(MessageCode.MachineDeleted);
        fnError(ErrorCode.MachineDeleteFailed);
        return {id, message: MessageCode.MachineDeleted};
    }

    /**
     * subscribeOnDevicesUpdate
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                deviceIds: {
                    type: 'array',
                    items: {type: 'string'},
                },
                sessionKey: {type: 'string'},
            },
            required: ['deviceIds', 'sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/subscribe', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async subscribeOnDevicesUpdate({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService} = this.di;
        const {deviceIds, sessionKey} = query;
        fnMessage(MessageCode.MachinesTracked);
        fnError(ErrorCode.MachinesTrackFailed);
        return MachineService.subscribeOnDevicesUpdate(sessionKey, deviceIds);
    }

    /**
     * subscribeOnDevicesUpdate
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                deviceIds: {
                    type: 'array',
                    items: {type: 'string'},
                },
                sessionKey: {type: 'string'},
            },
            required: ['deviceIds', 'sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/resubscribe', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async resubscribeOnDevicesUpdate({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService} = this.di;
        const {deviceIds, sessionKey} = query;
        fnMessage(MessageCode.MachinesTracked);
        fnError(ErrorCode.MachinesTrackFailed);
        return MachineService.resubscribeOnDevicesUpdate(sessionKey, deviceIds);
    }

    /**
     * unsubscribeFromDevicesUpdate
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                deviceIds: {
                    type: 'array',
                    items: {type: 'string'},
                },
                sessionKey: {type: 'string'},
            },
            required: ['deviceIds', 'sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/unsubscribe', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async unsubscribeFromDevicesUpdate({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService} = this.di;
        const {deviceIds, sessionKey} = query;
        fnMessage(MessageCode.MachinesUntracked);
        fnError(ErrorCode.MachinesUntrackFailed);
        return MachineService.unsubscribeFromDevicesUpdate(
            sessionKey,
            deviceIds,
        );
    }

    /**
     * unsubscribeFromAllDevicesUpdate
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                sessionKey: {type: 'string'},
            },
            required: ['sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/unsubscribe-all', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async unsubscribeFromAllDevicesUpdate({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService} = this.di;
        const {sessionKey} = query;
        fnMessage(MessageCode.MachinesUntracked);
        fnError(ErrorCode.MachinesUntrackFailed);
        return MachineService.unsubscribeFromAllDevicesUpdate(sessionKey);
    }

    /**
     * updateFCMToken
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                fcmToken: {type: 'string'},
                machineGuid: {type: 'string'},
            },
            required: ['fcmToken', 'machineGuid'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/updateToken', {
        allow: {
            [ROLE.GUEST]: [GRANT.READ],
        },
    })
    async updateFCMToken({query, identity, fnMessage, fnError}: ActionProps) {
        console.time('TIMER:updateFCMToken controller');
        const {MachineService} = this.di;
        const {machineGuid, fcmToken} = query;
        fnMessage(MessageCode.FCMTokenUpdated);
        fnError(ErrorCode.FCMTokenUpdateFailed);
        console.timeEnd('TIMER:updateFCMToken controller');
        return MachineService.updateFCMToken(machineGuid, fcmToken);
    }

    /**
     * getMachinesStatuses
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                deviceIds: {
                    type: 'array',
                    items: {type: 'string'},
                },
                sessionKey: {type: 'string'},
            },
            required: ['deviceIds', 'sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/statuses', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getMachinesStatuses({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const {MachineService} = this.di;
        const {deviceIds, sessionKey} = query;
        fnMessage(MessageCode.RequestSent);
        fnError(ErrorCode.RequestSendingFailed);
        return MachineService.getMachinesStatuses(sessionKey, deviceIds);
    }

    /**
     * confirmStatus
     */

    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: {type: 'array'},
                sessionKey: {type: 'string'},
            },
            required: ['data', 'sessionKey'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/confirmStatus', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async confirmStatus({query, identity, fnMessage, fnError}: ActionProps) {
        const {MachineService} = this.di;
        const {data, sessionKey} = query;
        fnMessage(MessageCode.RequestSent);
        fnError(ErrorCode.RequestSendingFailed);
        return MachineService.confirmStatus(sessionKey, data);
    }

    /**
     * getMachineIdentity
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                guid: { type: "string"}
            },
            required: ['guid'],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/identity', {
        allow: {
            [ROLE.MACHINE]: [GRANT.READ],
        },
    })
    async getMachineIdentity({query, identity, fnMessage, fnError}: ActionProps) {
        
        const {MachineService} = this.di;
        const { guid } = query
        fnMessage(MessageCode.RequestSent);
        fnError(ErrorCode.RequestSendingFailed);
        return MachineService.getMachineIdentity(guid)
    }
}
