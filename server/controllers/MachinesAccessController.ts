import BaseController from "./BaseController";
import { GET, POST, USE, SSR} from "server/decorators";
import validate, { validateProps } from "server/middleware/validate";
import entity from "server/decorators/entity";
import authTokenCheck from "../middleware/authTokenCheck";
import type { ActionProps } from ".";
import { ErrorCode, MessageCode } from "@/src/constants";
import { GRANT, ROLE } from "@/acl/types";

@entity("MachineAccessEntity")
export default class MachinesAccessController extends BaseController {
    /**
     * add
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                data: validateProps.machineAccess,
            },
            required: ["data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/access/add", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async add({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const data = query["data"];
        fnMessage(MessageCode.MachineAccessAdded);
        fnError(ErrorCode.MachineAccessAddFailed);
        return MachineAccessService.addMachineAccess(data);
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
    @GET("api/machines/access/:id", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public get({ query, fnMessage, fnError }: ActionProps) {
        const id = query["id"] as string;
        const { MachineAccessService } = this.di;
        fnMessage(MessageCode.MachineAccessInfoFetched);
        fnError(ErrorCode.MachineAccessFetchFailed);
        return MachineAccessService.findMachineAccessInfo(id);
    }

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
    @GET("api/machines/:id/accesses", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @SSR("/home/machines/:id", {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        }
    })
    public getRelatedAccess({ query, fnMessage, fnError }: ActionProps) {
        const id = query["id"] as string;
        const { MachineAccessService } = this.di;
        fnMessage(MessageCode.MachineAccessInfoFetched);
        fnError(ErrorCode.MachineAccessFetchFailed);
        return MachineAccessService.getAccessesByMachineID(id);
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
                data: validateProps.machineAccess,
            },
            required: ["id", "data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/access/:id/update", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async update({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const id = query["id"] as string;
        const data = query["data"];
        fnMessage(MessageCode.MachineAccessUpdated);
        fnError(ErrorCode.MachineAccessUpdateFailed);
        return MachineAccessService.updateMachineAccessData(id, data);
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
    @POST("api/machines/access/:id/delete", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async delete({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const id = query["id"] as string;
        fnMessage(MessageCode.MachineAccessDeleted);
        fnError(ErrorCode.MachineAccessDeleteFailed);
        return MachineAccessService.deleteMachineAccess(id);
    }

    /**
     * create
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                data: validateProps.machineAccessPostData,
            },
            required: ["data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/access/share", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async create({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const data = query["data"];
        fnMessage("machine access shared success");
        fnError("Can not share machine access");
        return MachineAccessService.shareAccess(data);
    }

    /**
     * getForCurrentUser
     */
    @USE(authTokenCheck)
    @POST("api/users/access", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getForCurrentUser({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const { MachineAccessService } = this.di;
        fnMessage(MessageCode.MachineAccessReceived);
        fnError(ErrorCode.MachineAccessReceiveFailed);
        return MachineAccessService.getAccessForUser(identity.userId);
    }

    /**
     * getForUser
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
    @POST("api/users/:id/access", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getForUser({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const id = query["id"] as string;
        fnMessage("machine access received success");
        fnError("Can not receive machine access");
        return MachineAccessService.getAccessForUser(id);
    }

    /**
     * getAccessedMachines
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
    @POST("api/users/:id/access/machines", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getAccessedMachines({
        query,
        identity,
        fnMessage,
        fnError,
    }: ActionProps) {
        const { MachineAccessService } = this.di;
        fnMessage("machine access received success");
        fnError("Can not receive machine access");
        return MachineAccessService.getAccessedMachines(identity.userId);
    }

    /**
     * getAccessedGroups
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
    @POST("api/users/:id/access/machines/groups", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getAccessedGroups({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const id = query["id"] as string;
        fnMessage("machine access received success");
        fnError("Can not receive machine access");
        return MachineAccessService.getAccessedGroups(id);
    }

    /**
     * receiveMessages
     */
    @USE(authTokenCheck)
    @USE(
        validate({
            type: "object",
            properties: {
                data: validateProps.machineReceiveMessagePostData,
            },
            required: ["data"],
            additionalProperties: false,
        })
    )
    @POST("api/machines/message", {
        allow: {
            [ROLE.OWNER]: [GRANT.READ],
        },
    })
    async receiveMessages({ query, fnMessage, fnError }: ActionProps) {
        const { MachineAccessService } = this.di;
        const data = query["data"];
        fnMessage(MessageCode.MachineReceivedMessage);
        fnError(ErrorCode.MachineReceivingMessageFailed);
        return MachineAccessService.receivingMessage(data);
    }
}
