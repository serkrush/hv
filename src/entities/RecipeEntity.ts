import Router from 'next/router';
import {call, put} from 'redux-saga/effects';
import * as actionTypes from '@/store/types/actionTypes';
import {BaseEntity} from './BaseEntity';
import action from './decorators/action';
import reducer from './decorators/reducer';
import {DEFAULT_PER_PAGE, ENTITY, Flag, RequestStatus} from '../constants';
import * as EntityTypes from './EntityTypes';
import {schema} from 'normalizr';
import alias from './decorators/alias';
import type {IPagerParams} from '../pagination/IPagerParams';
import { RecipeStageType, type IRecipeEntity } from './EntityTypes';
const {v4: uuidv4} = require('uuid');

@alias('RecipeEntity')
@reducer(ENTITY.RECIPES)
export default class RecipeEntity extends BaseEntity<RecipeEntity> {
    private deleteImages: string[] = [];

    constructor(opts: any) {
        super(opts);
        this.initSchema(ENTITY.RECIPES, {
            user_id: new schema.Entity(ENTITY.USERS),
            machine_id: new schema.Entity(ENTITY.MACHINES),
            categories: [new schema.Entity(ENTITY.CATEGORIES)],
            recipeFavorites: [new schema.Entity(ENTITY.RECIPE_FAVORITES)],
        });
    }

    @action()
    public *deleteIngredientImages({file}: {file: string}) {
        this.deleteImages.push(file);
    }

    @action()
    public *saveRecipe(data: IRecipeEntity) {
        const {media_resources_buffer, ...restValues} = data;
        let modifiedRecipeIngredients = [];
        if (restValues.recipe_ingredients?.length > 0) {
            for (let j = 0; j < restValues.recipe_ingredients.length; j++) {
                const {media_resource_buffer, ...restValuesIngredients} =
                    restValues.recipe_ingredients[j];
                modifiedRecipeIngredients = [
                    ...modifiedRecipeIngredients,
                    ...[restValuesIngredients],
                ];
            }
        }

        const modifiedData = {
            ...restValues,
            recipe_ingredients: modifiedRecipeIngredients,
            stages: restValues.stages.map((stage, index) => {
                const isLastStage = index === restValues.stages.length - 1;
                const isTimeSession =
                    data.type_session === RecipeStageType.Time;
                const isWeightSession =
                    data.type_session === RecipeStageType.Weight;

                return {
                    ...stage,
                    duration:
                        isTimeSession || !isLastStage ? stage.duration : 0,
                    weight: isWeightSession && isLastStage ? stage.weight : 0,
                };
            }),
            categories: restValues.categories.map(c => c.value),
        };

        const res = yield call(
            this.xSave,
            `/recipes/save/manufacturer`,
            modifiedData,
        );

        let media_resources = data?.media_resources ?? [];
        if (media_resources_buffer?.length > 0) {
            for (
                let index = 0;
                index < media_resources_buffer.length;
                index++
            ) {
                const name_file = `${uuidv4()}.png`;
                this.di.Firebase.uploadFile(
                    media_resources_buffer[index],
                    `/recipes/${res.response.data.id}/${name_file}`,
                );
                media_resources = [...media_resources, ...[name_file]];
            }
        }

        if (restValues.recipe_ingredients?.length > 0) {
            for (let j = 0; j < restValues.recipe_ingredients.length; j++) {
                const {media_resource_buffer, ...restValuesIngredients} =
                    restValues.recipe_ingredients[j];

                if (media_resource_buffer) {
                    let name_file = `${uuidv4()}.png`;
                    this.di.Firebase.uploadFile(
                        media_resource_buffer,
                        `/recipes/${res.response.data.id}/${name_file}`,
                    );
                    modifiedData.recipe_ingredients[j] = {
                        ...modifiedData.recipe_ingredients[j],
                        media_resource: name_file,
                    };
                }
            }
        }
        yield call(this.xSave, `/recipes/save/manufacturer`, {
            ...modifiedData,
            id: res.response.data.id,
            media_resources: media_resources,
        });

        const {t, ToastEmitter} = this.di;
        ToastEmitter.message('success-save-recipe');

        if (this.deleteImages?.length > 0) {
            for (let i = 0; i < this.deleteImages.length; i++) {
                this.di.Firebase.deleteFile(
                    `/recipes/${res.response.data.id}/${this.deleteImages[i]}`,
                );
            }
        }

        if (!data.id) {
            const href = `/home/recipes/${res.response.data.id}?mode=edit`;
            Router.replace(href, href, {shallow: true});
        }
    }

    @action()
    public *deleteRecipe(data: IRecipeEntity & {pagerName?: string, actionFetchingPagesName?:string})  {
        yield call(this.xDelete, `/recipes/delete/manufacturer`, {
            id: data.id,
        });
        if (data.pagerName && data.actionFetchingPagesName) {
            yield put({
                type: 'RecipeEntity_' + data.actionFetchingPagesName,
                page: 1,
                pageName: data.pagerName,
                perPage: DEFAULT_PER_PAGE,
                force: true,
            });
        }
        this.di.Firebase.deleteFolder(`/recipes/${data.id}`);
    }

    @action()
    public *savePreset(data: IRecipeEntity) {
        const {media_resources_buffer, ...restValues} = data;
        const modifiedData = {
            ...restValues,
            categories: restValues.categories.map(c => c.value),
        };

        const res = yield call(
            this.xSave,
            `/presets/save/manufacturer`,
            modifiedData,
        );

        let media_resources = data?.media_resources ?? [];
        if (media_resources_buffer?.length > 0) {
            for (
                let index = 0;
                index < media_resources_buffer.length;
                index++
            ) {
                const name_file = `${uuidv4()}.png`;
                this.di.Firebase.uploadFile(
                    media_resources_buffer[index],
                    `/recipes/${res.response.data.id}/${name_file}`,
                );
                media_resources = [...media_resources, ...[name_file]];
            }
        }

        yield call(this.xSave, `/presets/save/manufacturer`, {
            ...modifiedData,
            id: res.response.data.id,
            media_resources: media_resources,
        });

        const {t, ToastEmitter} = this.di;
        ToastEmitter.message('success-save-preset');

        if (!data.id) {
            const href = `/home/presets/${res.response.data.id}?mode=edit`;
            Router.replace(href, href, {shallow: true});
        }
    }

    @action()
    public *deletePreset(data: IRecipeEntity) {
        yield call(this.xDelete, `/presets/delete/manufacturer`, {
            id: data.id,
        });
    }

    @action()
    public *deleteFile({id, name}: {id: string; name: string}) {
        yield call(this.xSave, `/recipes/delete/file/${id}/${name}`, {});
        this.di.Firebase.deleteFile(`/recipes/${id}/${name}`);
    }

    @action()
    public *deleteMethodFile({id, name}: {id: string; name: string}) {
        yield call(this.xSave, `/recipes/delete/method-file/${id}/${name}`, {});
        this.di.Firebase.deleteFile(`/recipes/${id}/${name}`);
    }

    @action()
    public *fetchRecipesPage(data: IPagerParams) {
        yield call(this.pageEntity, `/recipes/page`, data);
    }

    @action()
    public *fetchPresetsPage(data: IPagerParams) {
        yield call(this.pageEntity, `/presets/page`, data);
    }

    @action()
    public *shareConfirm({invitationId, recipes, userId}) {
        const {ToastEmitter} = this.di;
        let modifiedData = [];
        for (let i = 0; i < recipes.length; i++) {
            modifiedData.push({
                ...recipes[i],
                user_id: userId,
                categories:
                    recipes[i].categories?.length > 0 ?
                    recipes[i].categories.map(category => category.value) : [],
            });
        }

        yield put(
            actionTypes.setRequestStatus({
                entityName: this.entityName,
                actionType: actionTypes.ADD,
                status: RequestStatus.LOADING,
            }),
        );

        const confirmData = yield call(
            this.xSave,
            `/invitations/recipes/${invitationId}/accept`,
            modifiedData,
        );
        if (confirmData.success) {
            ToastEmitter.message('invite-confirmed-success');
            yield put(
                actionTypes.setFlagger(
                    Flag.InviteRecipeConfirmedSuccess,
                    invitationId,
                ),
            );
        } else {
            if (confirmData?.response?.error) {
                ToastEmitter.errorMessage(confirmData?.response?.error);
            } else {
                yield call(Router.replace, `/error/500`);
            }
        }
    }
}
