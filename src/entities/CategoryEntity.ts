import { call, put } from "redux-saga/effects";
import { BaseEntity } from "./BaseEntity";
import action from "./decorators/action";
import reducer from "./decorators/reducer";
import { schema } from "normalizr";
import { ENTITY } from "../constants";
import alias from "./decorators/alias";
import type { ICategoryEntity } from "./EntityTypes";

@alias("CategoryEntity")
@reducer(ENTITY.CATEGORIES)
export default class CategoryEntity extends BaseEntity<CategoryEntity> {
    constructor(opts: any) {
        super(opts);
        this.initSchema(ENTITY.CATEGORIES, {
            user_id: new schema.Entity(ENTITY.USERS),
            machine_id: new schema.Entity(ENTITY.MACHINES),
        });
    }

    @action()
    public *fetchCategories() {
        yield call(this.xRead, `/categories`);
    }

    @action()
    public *saveCategory(data: ICategoryEntity) {
        yield call(this.xSave, `/categories/save/manufacturer`, data);
    }

    @action()
    public *deleteCategory(data: ICategoryEntity) {
        yield call(this.xDelete, `/categories/delete/manufacturer`, {
            id: data.id,
        });
    }
}
