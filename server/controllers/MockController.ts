import BaseController from "./BaseController";
import { POST, USE } from "server/decorators";
import authTokenCheck from "../middleware/authTokenCheck";
import { mockDehydrator } from "@/mocks/mockGenerator";
import type { ActionProps } from ".";
import { GRANT, ROLE } from "@/acl/types";

export default class MockController extends BaseController {
    /**
     * pairMachine
     */
    @USE(authTokenCheck)
    @POST("api/mock/machines/pair", {
        allow: {
            [ROLE.USER]: [GRANT.READ],
        },
    })
    async pairMachine({ query, identity, fnMessage, fnError }: ActionProps) {
        const { MachineService } = this.di;
        const data = mockDehydrator();
        fnMessage("MOCK: machine paired success");
        fnError("MOCK: Can not pair machine");
        return MachineService.pairDehydrator(data, identity.userId);
    }


    
}
