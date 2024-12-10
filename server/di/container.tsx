import IModelContainer from "server/models/IModelContainer";
import services from "server/services";
import controllers from "server/controllers";
import Firebase from "../db";
import config from "@/config";
import { roles, rules } from "@/config.acl";

import * as awilix from "awilix";
import Mail from "../mail/mail";
import Logger from "../logger";
import RedisService from "../services/Redis";

const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
});

container.register({
    config: awilix.asValue(config),
    roles: awilix.asValue(roles),
    rules: awilix.asValue(rules),
    firebase: awilix.asClass(Firebase).singleton(),
    Mail: awilix.asClass(Mail).singleton(),
    logger: awilix.asClass(Logger).singleton(),
    cacher: awilix.asClass(RedisService).singleton(),
    ...IModelContainer,
    ...services,
    ...controllers,
});

const firebase = container.resolve("firebase");
firebase.setupIfNeeded();

const cacher = container.resolve('cacher');
cacher.connect();

export default container;
