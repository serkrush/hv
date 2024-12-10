// import { GRANT, IIdentityACL } from "@/src/acl/types";
import { IIdentity } from "@/acl/types";
import IContextContainer from "./interfaces/IContextContainer";
import Guard from "@/acl/Guard";
// import { roles, rules } from "@/src/acl/config";
// import { cleanRoles, cleanRules } from "@/src/acl/cleaner";
// import { ENTITY, ResponseCode } from "@/src/constants";
// import httpStatus from "@/src/http-status";
// import container from "./container";

declare module 'next' {
  interface NextApiRequest {
    guard: Guard;
    identity: IIdentity
  }

}

export default class BaseContext {
    protected di: IContextContainer;

    constructor(opts: IContextContainer) {
        this.di = opts;
    }
}
