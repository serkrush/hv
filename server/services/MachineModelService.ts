import BaseContext from "server/di/BaseContext";
import { IMachineModel } from "../models/MachineModel";
import { Cacher, DEFAULT_SORT_DIR, DEFAULT_SORT_FIELD, ErrorCode, MessageCode } from "@/src/constants";
import { IPagerParams } from "@/src/pagination/IPagerParams";
import { TypesaurusCore, TypesaurusQuery } from "typesaurus";

export default class MachineModelService extends BaseContext {
    /**
     * getAllModels
     */
    public async getAllModels() {
        const { Models, cacher } = this.di;
        let items = await cacher.getCache(Cacher.AllModels);
        if(!items) {
            const models = await Models.all()
            items = models.map((model) => {
                return { ...model.data, id: model.ref.id }
            })
            await cacher.saveCache(Cacher.AllModels, items);
        }
        
        return items;
    }

    /**
     * findModelInfo
     */
    public async findModelInfo(id: string) {
        const { Models } = this.di;
        const model = await Models.get(Models.id(id));
        if (model) {
            return { ...model.data, id: model.ref.id };
        } else {
            throw new Error(ErrorCode.NotFoundModel);
        }
    }

    /**
     * findModelByTitle
     */
    public async findModelByTitle(model: string) {
        const { Models } = this.di;
        const models = await Models.query(($) => $.field("model").eq(model));
        if (models.length > 0 && models[0]) {
            return { ...models[0].data, id: models[0].ref.id };
        } else {
            return null;
        }
    }

    /**
     * addModel
     */
    public async addModel(data: IMachineModel) {
        data.id = data.model.toLowerCase()
        return this.addModelWithId(data.id, data)
    }

    /**
     * addModelWithId
     */

    public async addModelWithId(id: string, data: IMachineModel) {
        const { Models } = this.di;
        const res = await Models.set(Models.id(data.id), data);
        const newModel = await res.get()
        return {...newModel?.data, id: newModel?.ref.id};
    }

    public async updateModel(data: IMachineModel) {
        const old = await this.findModelInfo(data.id);
        if (old) {
            return this.addModelWithId(data.id, {...old, ...data});
        } else {
            throw new Error(ErrorCode.NotFoundModel);
        }
    }


    public async saveModel(data: IMachineModel){
        await this.di.cacher.deleteCache(Cacher.AllModels);
        if(data?.id) {
            return this.updateModel(data)
        }
        return this.addModel(data);
    }

    /**
     * updateModelData
     */
    public async updateModelData(id: string, data: IMachineModel) {
        const old = await this.findModelInfo(id);
        if (old) {
            return this.addModelWithId(id, { ...old, ...data });
        } else {
            throw new Error(ErrorCode.NotFoundModel);
        }
    }

    /**
     * deleteModel
     */
    public async deleteModel(id: string) {
        const { Models } = this.di;
        await Models.remove(Models.id(id));
        await this.di.cacher.deleteCache(Cacher.AllModels);
        return { id, message: MessageCode.MachineModelDeleted };
    }

    public async deleteFile({id, name}) {
        const { Models } = this.di;
        const oldModel = await Models.get(Models.id(id));
        if (oldModel) {
            const updateRecipe = (await oldModel?.get()).data;
            const new_media_resources = ""
            const data = {
                ...updateRecipe,
                mediaResources: new_media_resources,
            };
            await this.di.cacher.deleteCache(Cacher.AllModels);
            await oldModel.update(data);
            return {...data, id};
        }else {
            throw new Error(ErrorCode.NotFoundModel);
        }
    }


    public async page(pager: IPagerParams) {
        const {
            Models,
            firebase: {firestore},
            cacher
        } = this.di;
        const {page, perPage, lastDocumentId} = pager;
        const filter = (
            helper: TypesaurusQuery.Helpers<
                TypesaurusCore.CollectionDef<
                    'models',
                    IMachineModel,
                    false,
                    false,
                    false
                >
            >,
        ) => {
            return Object.keys(pager.filter ?? {}).map(key => {
                return helper.field(key as keyof IMachineModel).eq(pager.filter![key]);
            });
        };
        
        let count = await Models.query($ => [...filter($)]).count();
        let sortField = "model";
        if (pager.sort && pager.sort['field']) {
            sortField = pager.sort['field'];
        }

        let sortDirection = DEFAULT_SORT_DIR;
        if (pager.sort && pager.sort['dir']) {
            sortDirection = pager.sort['dir'];
        }

        let query = firestore
            .collection('models')
            .orderBy(sortField, sortDirection as any);
        Object.keys(pager.filter ?? {}).forEach(key => {
            query = query.where(key, '==', pager.filter![key]);
        });
        if (lastDocumentId) {
            const afterDocument = await firestore
                .collection('models')
                .doc(lastDocumentId)
                .get();
            query = query.startAfter(afterDocument);
        }

        const items = await query.limit(perPage).get();
        const res = items.docs.map(item => {
            return item.data();
        });
        
        return {
            items: res,
            count,
        };
    }
}
