import { call, put } from "redux-saga/effects";
import { BaseEntity, HTTP_METHOD } from "./BaseEntity";
import * as actionTypes from "@/store/types/actionTypes";
import action from "./decorators/action";
import reducer from "./decorators/reducer";
import alias from "./decorators/alias";

@alias("MachineGroupEntity")
@reducer("machineGroups")
export default class MachineGroupEntity extends BaseEntity<MachineGroupEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema('machineGroups', {}, {});
    }
}
