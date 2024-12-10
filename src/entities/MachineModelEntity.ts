import { call, put } from "redux-saga/effects";
import type { IPagerParams } from "../pagination/IPagerParams";
import { BaseEntity } from "./BaseEntity";
import action from "./decorators/action";
import alias from "./decorators/alias";
import reducer from "./decorators/reducer";
import Router from 'next/router';
import { DEFAULT_PER_PAGE } from "../constants";
import type { IMachineEntity } from "./EntityTypes";
const {v4: uuidv4} = require('uuid');

@alias("MachineModelEntity")
@reducer("machines-models")
export default class MachineModelEntity extends BaseEntity<MachineModelEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema('machines-models', {}, {});
    }

    @action()
    public *saveMachineModel(data: IMachineEntity) {
        const {mediaResourcesBuffer, ...restValues} = data;
        const res = yield call(
            this.xSave,
            `/machines/models/save`,
            restValues,
        );
        let mediaResources = data?.mediaResources ?? null;
        if (mediaResourcesBuffer) {
            const name_file = `${uuidv4()}.png`;
            this.di.Firebase.uploadFile(
                mediaResourcesBuffer,
                `/models/${res.response.data.id}/${name_file}`,
            );
            mediaResources = name_file;

            yield call(this.xSave, `/machines/models/save`, {
                ...restValues,
                id: res.response.data.id,
                mediaResources: mediaResources,
            });
        }

        const {t, ToastEmitter} = this.di;
        if (res.response.data.id) {
            ToastEmitter.message('success-save-model');
            const href = `/home/machines-models/${res.response.data.id}?mode=edit`;
            Router.replace(href, href, {shallow: true});
        }
    }

    @action()
    public *deleteFile({id, name}: {id: string; name: string}) {
        yield call(this.xSave, `/machines/models/delete/file/${id}/${name}`, {});
        this.di.Firebase.deleteFile(`/models/${id}/${name}`);
    }

    @action()
    public *fetchMachinesModelPage(data: IPagerParams) {
        yield call(this.pageEntity, `/machines/models/page`, data);
    }

    @action()
    public *deleteMachineModel(data: IMachineEntity & {pagerName?: string, actionFetchingPagesName?:string})  {
        yield call(this.xDelete, `/machines/models/delete`, {
            id: data.id,
        });
        if(data.pagerName && data.actionFetchingPagesName) {
            yield put({type: "MachineModelEntity_" + data.actionFetchingPagesName, 
                page: 1,
                pageName: data.pagerName,
                perPage: DEFAULT_PER_PAGE,
                force: true,
            })
        }
        this.di.Firebase.deleteFolder(`/models/${data.id}`);
    }
}
