import { IModelContainer } from "server/models/IModelContainer";
import { IServicesContainer } from "server/services";
import { IControllerContainer } from "server/controllers";

import Mail from "@/server/mail/mail";
import { IRoles, IRules } from "@/acl/types";
import Firebase from "@/server/db";
import Logger from "@/server/logger";
import RedisService from "@/server/services/Redis";

export default interface IContextContainer
    extends IModelContainer,
        IServicesContainer,
        IControllerContainer {
    config: any;
    firebase: Firebase;
    Mail: Mail;
    cacher: RedisService;
    roles: IRoles;
    rules: IRules;
    logger: Logger;
}
