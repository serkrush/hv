import { call, put } from "redux-saga/effects";
import { BaseEntity, HTTP_METHOD } from "./BaseEntity";
import * as actionTypes from "@/store/types/actionTypes";
import action from "./decorators/action";
import reducer from "./decorators/reducer";
import alias from "./decorators/alias";
import type { IPagerParams } from "../pagination/IPagerParams";
import { schema } from "normalizr";


@alias("MachineEntity")
@reducer("machines")
export default class MachineEntity extends BaseEntity<MachineEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema('machines', {
            ownerId: new schema.Entity('users', {}, {idAttribute: 'uid'})
        }, {});
    }

    @action()
    public *fetchMachinesPage(data: IPagerParams) {
        yield call(this.pageEntity, `/machines/page`, data);
    }
}
