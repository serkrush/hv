import BaseController from "./BaseController";
import { POST, USE, SSR, pager, GET } from "server/decorators";
import entity from "server/decorators/entity";
import authTokenCheck from "../middleware/authTokenCheck";
import type { ActionProps } from ".";
import { DEFAULT_PER_PAGE, DEFAULT_SORT_DIR, DEFAULT_SORT_FIELD, ErrorCode, MessageCode, ResponseCode } from "@/src/constants";
import { GRANT, ROLE } from "@/acl/types";
import validate, { validateProps } from "../middleware/validate";

@entity("MachineModelEntity")
export default class MachineModelController extends BaseController {
    @USE(authTokenCheck)
    @pager()
    @SSR('/home/machines-models', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getMachinesModelsPaginatedSSR({query, pager, fnMessage, fnError}) {
        const {MachineModelService} = this.di;
        pager.filter = {};
        pager.perPage = DEFAULT_PER_PAGE;
        pager.entityName = 'machines-models';
        pager.pageName = 'models';
        fnMessage('success-model-info');
        fnError('error-model-info');
        return MachineModelService.page(pager);
    }


    @pager()
    @USE(authTokenCheck)
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
                lastDocumentId: { type: ['string', 'null'] },
            },
            required: [],
            additionalProperties: false,
        }),
    )
    @POST('api/machines/models/page', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    async getMachinesModelsPaginated({pager, fnMessage, fnError}: ActionProps) {
        const {MachineModelService} = this.di;
        fnMessage('success-model-info');
        fnError('error-model-info');
        return MachineModelService.page(pager);
    }
    

    @USE(authTokenCheck)
    @SSR('/home/machines-models/add', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public getAddRecipe() {
        return Promise.resolve({});
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
    @GET('api/machines/models/:id', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    @SSR('/home/machines-models/:id', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public findModelInfo({query, fnMessage, fnError}) {
        const id = query['id'] as string;
        const {MachineModelService} = this.di;
        fnMessage('success-info');
        fnError('error-info');
        return MachineModelService.findModelInfo(id);
    }

    @USE(authTokenCheck)
    @POST('api/machines/models/save', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public saveModel({query, identity, fnMessage, fnError}) {
        const {MachineModelService} = this.di;
        fnMessage('success-save-model');
        fnError('error-save-model');
        return MachineModelService.saveModel(query);
    }


    @USE(authTokenCheck)
   
    @POST('api/machines/models/delete', {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    public deleteModel({query, identity, fnMessage, fnError}) {
        const {MachineModelService} = this.di;
        fnMessage('success-delete-model', ResponseCode.TOAST);
        fnError('error-delete-model', ResponseCode.TOAST);
        return MachineModelService.deleteModel(query.id);
    }
    
    /**
     * findForUser
     */
    @USE(authTokenCheck)
    @POST("api/machines/models", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async getAllModels({ query, identity, fnMessage, fnError }: ActionProps) {
        const { MachineModelService } = this.di;
        fnMessage(MessageCode.MachinesReceived);
        fnError(ErrorCode.MachinesReceiveFailed);
        return MachineModelService.getAllModels();
    }

    @USE(authTokenCheck)
    @POST('api/machines/models/delete/file/:id/:name', {
        allow: {
            [ROLE.ROOT]: [GRANT.READ],
        },
    })
    public deleteFile({query, fnMessage, fnError}) {
        const {MachineModelService} = this.di;
        const id = query['id'] as string;
        const name = query['name'] as string;
        fnMessage('success-file-delete', ResponseCode.TOAST);
        fnError('error-file-delete', ResponseCode.TOAST);
        return MachineModelService.deleteFile({
            id,
            name,
        });
    }
}
