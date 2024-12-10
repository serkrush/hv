import JobHandler from "@/src/JobHandler";
import { IEntityContainer } from "src/entities";
import ToastEmitter from "src/toastify/toastEmitter";
import BaseStore from "store/store";

export default interface IClientContextContainer
  extends IEntityContainer {
    redux: BaseStore,
    ToastEmitter: ToastEmitter
    t: Function
    job: JobHandler
}