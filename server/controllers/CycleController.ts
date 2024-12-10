import BaseController from './BaseController';
import entity from 'server/decorators/entity';
import {GET, POST, SSR, USE, pager} from 'server/decorators';
import authTokenCheck from '../middleware/authTokenCheck';
import validate, {validateProps} from '../middleware/validate';
import {GRANT, ROLE} from '@/acl/types';
import {MessageCode, ErrorCode, ResponseCode} from '@/src/constants';
import type {ActionProps} from '.';
import {CycleStatus} from '../models/ICycleModel';

@entity('CycleEntity')
export default class CycleController extends BaseController {
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: validateProps.cycleScheduleData,
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/cycles/schedule', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async scheduleCycle({query, identity, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const data = query['data'];
        const {machineId, zoneNumber, params, recipeId, scheduledTime} = data;
        fnMessage(MessageCode.CycleScheduled, ResponseCode.TOAST);
        fnError(ErrorCode.CycleScheduleFailed, ResponseCode.TOAST);
        return CycleService.scheduleCycle({
            machineId,
            zoneNumber,
            params,
            recipeId,
            scheduledTime,
        });
    }

    /**
     * getMachinesCycles
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: {
                    type: 'object',
                    properties: {
                        status: {type: 'string'},
                    },
                    validateProperty: {
                        status: 'status',
                    },
                    additionalProperties: false,
                },
            },
            required: ['id'],
            additionalProperties: false,
        }),
    )
    @POST('api/cycles/machine/:id', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getMachinesCycles({query, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const id = query['id'] as string;
        let status: CycleStatus | undefined = undefined;
        const data = query['data'];
        if (data) {
            status = data['status'];
        }
        fnMessage(MessageCode.CycleReceived);
        fnError(ErrorCode.CycleScheduleFailed);
        return CycleService.getMachinesCycles(id, status);
    }

    /**
     * getMachinesCycles
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        guid: {type: 'string'},
                        status: {type: 'string'},
                    },
                    validateProperty: {
                        status: 'status',
                    },
                    additionalProperties: false,
                    required: ['guid'],
                },
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/cycles/machine', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getMachinesCyclesByGuid({query, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const {status, guid} = query['data'];
        fnMessage(MessageCode.CycleReceived);
        fnError(ErrorCode.CycleScheduleFailed);
        return CycleService.getMachinesCyclesByGuid(guid, status);
    }

    /**
     * syncCycles
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        guid: {type: 'string'},
                        cycles: {type: validateProps.cycleData},
                        status: {type: 'string'},
                    },
                    validateProperty: {
                        status: 'status',
                    },
                    additionalProperties: false,
                    required: ['guid', 'cycles'],
                },
            },
            required: ['data'],
            additionalProperties: false,
        }),
    )
    @POST('api/cycles/machine/sync/scheduled', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async syncScheduledCycles({query, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const {cycles, guid} = query['data'];
        fnMessage(MessageCode.CycleReceived);
        fnError(ErrorCode.CycleScheduleFailed);
        return CycleService.syncScheduledCycles(guid, cycles);
    }

    /**
     * updateCycle
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: 'object',
            properties: {
                id: validateProps.queryId,
                data: validateProps.cycleData,
            },
            required: ['id', 'data'],
            additionalProperties: false,
        }),
    )
    @POST('api/cycles/:id/update', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async updateCycle({query, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const id = query['id'] as string;
        const data = query['data'];
        fnMessage(MessageCode.CycleUpdated);
        fnError(ErrorCode.CycleUpdateFailed);
        return CycleService.updateCycleData(id, data);
    }

    /**
     * updateCycle
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
    @POST('api/cycles/:id/delete', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async deleteCycle({query, fnMessage, fnError}: ActionProps) {
        const {CycleService} = this.di;
        const id = query['id'] as string;
        fnMessage(MessageCode.CycleDeleted);
        fnError(ErrorCode.CycleDeleteFailed);
        return CycleService.deleteCycle(id);
    }
}
