import BaseController from "./BaseController";
import { GET, POST, SSR, USE } from "server/decorators";
import validate, { validateProps } from "server/middleware/validate";
import entity from "server/decorators/entity";
import authTokenCheck from "../middleware/authTokenCheck";
import type { ActionProps } from ".";
import { ErrorCode, MessageCode } from "@/src/constants";
import { GRANT, ROLE } from "@/acl/types";

@entity("MachineGroupEntity")
export default class MachineGroupController extends BaseController {
    /**
     * add
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                data: validateProps.machineGroup,
            },
            required: ["data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/groups/add", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async add({ query, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const data = query["data"];
        fnMessage(MessageCode.MachineGroupAdded);
        fnError(ErrorCode.MachineGroupAddFailed);
        return MachineGroupService.addMachineGroup(data);
    }

    /**
     * get
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                id: validateProps.queryId,
            },
            required: ["id"],
            additionalProperties: false,
        })
    )
    @GET("api/machines/groups/:id", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public get({ query, fnMessage, fnError }: ActionProps) {
        const id = query["id"] as string;
        const { MachineGroupService } = this.di;
        fnMessage(MessageCode.MachineGroupInfoFetched);
        fnError(ErrorCode.MachineGroupFetchFailed);
        return MachineGroupService.findMachineGroupInfo(id);
    }

    /**
     * update
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                id: validateProps.queryId,
                data: validateProps.machineGroup,
                excludedFCM: {
                    type: 'array',
                    items: { type: 'string'}
                }
            },
            required: ["id", "data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/groups/:id/update", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async update({ query, identity, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const id = query["id"] as string;
        const {data, excludedFCM } = query
        
        fnMessage(MessageCode.MachineGroupUpdated);
        fnError(ErrorCode.MachineGroupUpdateFailed);
        return MachineGroupService.updateMachineGroupData(id, data, true, excludedFCM ?? []);
    }

    /**
     * delete
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                id: validateProps.queryId,
            },
            required: ["id"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/groups/:id/delete", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async delete({ query, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const id = query["id"] as string;
        fnMessage(MessageCode.MachineGroupDeleted);
        fnError(ErrorCode.MachineGroupDeleteFailed);
        return MachineGroupService.deleteMachineGroup(id);
    }

    /**
     * create
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                data: validateProps.machineGroupPostData,
            },
            required: ["data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/groups/create", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async create({ query, identity, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const data = query["data"];
        fnMessage(MessageCode.MachineGroupCreated);
        fnError(ErrorCode.MachineGroupCreateFailed);
        return MachineGroupService.createMachineGroup({
            ...data,
            creatorId: identity.userId,
        });
    }

    /**
     * getForUser
     */
    @USE(authTokenCheck)
    @POST("api/machines/groups", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getForUser({ query, identity, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        fnMessage(MessageCode.MachineGroupsReceived);
        fnError(ErrorCode.MachineGroupsReceiveFailed);
        const {ids} = query;
        if (ids != undefined && ids.length > 0) {
            return MachineGroupService.findByIds(ids, true, identity.userId);
        } else {
            return MachineGroupService.getMachineGroupsForUser(identity.userId);
        }
    }

    /**
     * getGroupMachines
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                id: validateProps.queryId,
            },
            required: ["id"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/groups/:id/machines", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getGroupMachines({ query, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const id = query["id"] as string;
        fnMessage(MessageCode.MachineGroupMachinesReceived);
        fnError(ErrorCode.MachineGroupMachinesReceiveFailed);
        return MachineGroupService.getMachinesForGroup(id);
    }

    /**
     * getGroupsByMachineID
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                id: validateProps.queryId,
            },
            required: ["id"],
            additionalProperties: false,
        })
    )
    @GET("api/machines/:id/groups", {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    @SSR("/home/machines/:id", {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        }
    })
    async getGroupsByMachineID({ query, fnMessage, fnError }: ActionProps) {
        const { MachineGroupService } = this.di;
        const id = query["id"] as string;
        fnMessage(MessageCode.MachineGroupMachinesReceived);
        fnError(ErrorCode.MachineGroupMachinesReceiveFailed);
        return MachineGroupService.getGroupsByMachineID(id);
    }
}
