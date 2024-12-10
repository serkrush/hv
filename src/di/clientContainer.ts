import entities from "src/entities";
import * as awilix from "awilix";
import ReduxStore from "store/store";
import { asClass } from "awilix";
import ToastEmitter from "src/toastify/toastEmitter";
import "@/src/utils/i18n";
import i18next from "i18next";
import IClientContextContainer from "./interfaces/container";
import { useRouter } from "next/router";
import JobHandler from "../JobHandler";
import { BaseEntity } from "../entities/BaseEntity";

const t = (ctx: IClientContextContainer) => i18next.t;

const clientContainer = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
});

async function registerContainer() {

    const job: JobHandler = clientContainer.resolve('job');
    job.start();
}

clientContainer.register({
    ...entities,
    redux: asClass(ReduxStore).singleton(),
    ToastEmitter: asClass(ToastEmitter).singleton(),
    t: awilix.asFunction(t).singleton(),
    job: asClass(JobHandler).singleton()
});

registerContainer().catch((e) => {
    console.error('can not register container', e);
});

export default clientContainer;
