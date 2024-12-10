import { call, put } from "redux-saga/effects";
import { BaseEntity, HTTP_METHOD } from "./BaseEntity";
import * as actionTypes from "@/store/types/actionTypes";
import action from "./decorators/action";
import reducer from "./decorators/reducer";
import alias from "./decorators/alias";

@alias("MachineAccessEntity")
@reducer("machineAccess")
export default class MachineAccessEntity extends BaseEntity<MachineAccessEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema('machineAccess', {}, {});
    }
}
