import BaseContext from 'server/di/BaseContext';
import {ICategoryModel, RecipeProcessType} from '../models/ICategoryModel';
import {groups} from 'typesaurus';
import { Cacher } from '@/src/constants';

export default class CategoryService extends BaseContext {
    /**
     * getCategoriesAdmin
     */
    public async getCategoriesAdminRecipe() {
        console.time('TIMER:CATEGORIES');
        const {
            firebase: {schema},
            cacher
        } = this.di;
        let items: ICategoryModel[] = await cacher.getCache(Cacher.AllCategories)
        if(!items){
            const categories = await groups(schema).categories.query($ => [
                $.field('user_id').eq(null),
                $.field('machine_id').eq(null),
                $.field('recipe_process').eq(RecipeProcessType.Recipe),
            ]);

            items = categories.reduce(
                (a: ICategoryModel[], v) => {
                    const data = {
                        ...v.data,
                        id: v.ref.id,
                    };
                    a.push(data);
                    return a;
                },
                [],
            );
            await cacher.saveCache(Cacher.AllCategories, items);
        }
        console.timeEnd('TIMER:CATEGORIES');
        return items;
    }
    /**
     * getCategoriesUserForGuest
     */
    public async getCategoriesUserForGuest() {
        const {
            firebase: {schema},
        } = this.di;
        const categories = await groups(schema).categories.query($ => [
            $.field('user_id').eq(null),
            $.field('machine_id').eq(null),
            $.field('recipe_process').eq(RecipeProcessType.Recipe),
        ]);

        const items: ICategoryModel[] = categories.reduce(
            (a: ICategoryModel[], v) => {
                const data = {
                    ...v.data,
                    id: v.ref.id,
                };
                a.push(data);
                return a;
            },
            [],
        );
        return items;
    }
    /**
     * getAllCategories
     */
    public async getAllCategories() {
        const {
            firebase: {schema},
        } = this.di;
        const categories = await groups(schema).categories.all();

        const items: ICategoryModel[] = categories.reduce(
            (a: ICategoryModel[], v) => {
                const data = {
                    category_name: v?.data?.category_name,
                    recipe_process: v?.data?.recipe_process,
                    parent_id: v?.data?.parent_id ?? '',
                    id: v.ref.id,
                    user_id: v?.data?.user_id,
                };
                a.push(data);
                return a;
            },
            [],
        );
        return items;
    }

    /**
     * saveToRoot
     */
    public saveToRoot(data: ICategoryModel): Promise<ICategoryModel> {
        const {
            firebase: {schema},
        } = this.di;
        this.di.cacher.deleteCache(Cacher.AllCategories);
        return this.saveCategory(schema, data);
    }
    /**
     * saveToMachine
     */
    public async saveToMachine(data: ICategoryModel): Promise<ICategoryModel> {
        const categories = await this.getGroupCategories(data);
        const category = categories.find(
            category => category.ref.id === data.id,
        );
        if(data?.category_name) {
            data.category_name = data.category_name?.trim();
        }
        if (category) {
            await category?.update(data);
            const updateCategory = await category?.get();
            return {...updateCategory?.data, id: updateCategory?.ref.id};
        } else {
            const {
                Machines,
                firebase: {schema},
            } = this.di;
            let fData = data;
            console.log('saveToMachine start', fData);
            if (!data.machine_id && data.uid) {
                const {uid, ...restData} = data;
                const machines = await Machines.query($ =>
                    $.field('guid').eq(uid),
                );
                fData = {
                    ...restData,
                    machine_id: machines[0].ref.id,
                };
            }
            if (fData.machine_id) {
                let refCollection = schema.machines(Machines.id(fData.machine_id));
                if (fData.parent_id && data.parent_id !== null) {
                    const categories = await this.getGroupCategories(fData);
                    const parentIds: string[] = [];
                    await this.getParentsCollections(
                        categories,
                        fData.parent_id,
                        parentIds,
                    );
                    refCollection = this.findCategorParent(schema.machines(Machines.id(fData.machine_id)), parentIds);
                }
                const res = await refCollection.categories.set(Machines.sub.categories.id(fData.id), fData);
                const newCategory = await res.get();
                return {...newCategory?.data, id: newCategory?.ref.id};
            }
        }
    }

    /**
     * saveToUser
     */
    public saveToUser(data: ICategoryModel): Promise<ICategoryModel> {
        const {
            Users,
            firebase: {schema},
        } = this.di;
        if (data.user_id) {
            return this.saveCategory(
                schema.users(Users.id(data.user_id)),
                data,
            );
        }
    }

    private getParentsCollections(
        categories,
        parentId: string,
        parentIds: string[],
    ) {
        if (parentId && parentId !== null) {
            parentIds.unshift(parentId);
            const upCategory = categories.find(c => {
                return c.ref.id === parentId;
            });
            if (
                upCategory &&
                upCategory?.data.parent_id &&
                upCategory?.data.parent_id !== null
            ) {
                this.getParentsCollections(
                    categories,
                    upCategory?.data.parent_id,
                    parentIds,
                );
            }
        }
    }

    private getGroupCategories(data) {
        console.log('getGroupCategories data', data);
        const {
            firebase: {schema},
        } = this.di;
        return groups(schema).categories.query($ => [
            $.field('user_id').eq(data.user_id ?? null),
            $.field('machine_id').eq(data.machine_id ?? null),
            $.field('recipe_process').eq(data.recipe_process),
        ]);
    }

    /**
     * deleteCategory
     */
    public async deleteCategory(data, userId) {
        const {
            firebase: {schema},
        } = this.di;
        const {id} = data;
        const categories = await groups(schema).categories.query($ => [
            $.field('user_id').eq(userId ?? null),
            $.field('machine_id').eq(data.machine_id ?? null),
            $.field('recipe_process').eq(RecipeProcessType.Recipe),
        ]);

        console.log('categories deleteCategory', categories)

        const category = categories.find(category => category.ref.id === id);

        const recipes = await groups(schema).recipes.query($ => [
            $.field('machine_id').eq(data.machine_id),
            $.field('user_id').eq(null),
            $.field('categories').containsAny([category.ref.id]),
        ]);

        if (recipes.length > 0) {
            throw new Error('delete recipes');
        }

        this.daleteItem(categories, category?.ref.id);

        const categoryDeleted = await category?.get();
        await categoryDeleted?.remove();

        return {id};
    }

    private findCategorParent(categories: any, parentIds: string[]) {
        const {Categories} = this.di;
        let refCategories = categories;
        for (let i = 0; i < parentIds.length; i++) {
            const parentID = parentIds[i];
            if (parentID) {
                refCategories = refCategories.categories(
                    Categories.id(parentID),
                );
            }
        }
        return refCategories;
    }

    private async addCategory(data, ref: any) {
        console.log('addCategory start')
        let refCollection = ref;
        if (data.parent_id && data.parent_id !== null) {
            const categories = await this.getGroupCategories(data);
            const parentIds: string[] = [];
            await this.getParentsCollections(
                categories,
                data.parent_id,
                parentIds,
            );
            refCollection = this.findCategorParent(ref, parentIds);
        }
        if(data?.category_name) {
            data.category_name = data.category_name?.trim();
        }
        const res = await refCollection.categories.set(data.id, data);
        const newCategory = await res.get();
        return {...newCategory?.data, id: newCategory?.ref.id};
    }

    private async updateCategory(data): Promise<ICategoryModel> {
        console.log('updateCategory start')
        const categories = await this.getGroupCategories(data);
        const category = categories.find(
            category => category.ref.id === data.id,
        );
        if(data?.category_name) {
            data.category_name = data.category_name?.trim();
        }
        if (category) {
            await category?.update(data);
            const updateCategory = await category?.get();
            return {...updateCategory?.data, id: updateCategory?.ref.id};
        }
        throw new Error('Can not update category. Wrong category ID');
    }

    /**
     * saveCategory
     */
    public async saveCategory(ref: any, data: ICategoryModel) {
        const categories = await this.getGroupCategories(data);
        const category = categories.find(
            category => category.ref.id === data.id,
        );
        if (category) {
            return this.updateCategory(data);
        } else {
            return this.addCategory(data, ref);
        }
    }

    private async daleteItem(categories, parentId) {
        if (categories && categories.length > 0) {
            const subcategory = categories.filter(category => {
                return category.data.parent_id === parentId;
            });
            if (subcategory && subcategory.length > 0) {
                for (let i = 0; i < subcategory.length; i++) {
                    await this.daleteItem(categories, subcategory[i].ref.id);
                    const categoryDeleted = await subcategory[i].get();
                    await categoryDeleted?.remove();
                }
            }
        }
    }

    public async getCategoriesMachine(uid: string) {
        if (uid) {
            const {
                Machines,
                firebase: {schema},
            } = this.di;
            const machines = await Machines.query($ => $.field('guid').eq(uid));
            if (machines?.length > 0) {
                const {
                    firebase: {schema},
                } = this.di;
                const categories = await groups(schema).categories.query($ => [
                    $.field('user_id').eq(null),
                    $.field('machine_id').eq(machines[0].ref.id),
                    $.field('recipe_process').eq(RecipeProcessType.Recipe),
                ]);
                const items: ICategoryModel[] = categories.reduce(
                    (a: ICategoryModel[], v) => {
                        const data = {
                            ...v.data,
                            id: v.ref.id,
                        };
                        a.push(data);
                        return a;
                    },
                    [],
                );
                return items;
            }
        } else {
            throw new Error('ErrorCode.NoRecipeForId');
        }
    }

    public async getCategoriesUser(userId: string) {
        const {
            firebase: {schema},
        } = this.di;
        const categories = await groups(schema).categories.query($ => [
            $.field('user_id').eq(userId),
            $.field('machine_id').eq(null),
            $.field('recipe_process').eq(RecipeProcessType.Recipe),
        ]);
        const items: ICategoryModel[] = categories.reduce(
            (a: ICategoryModel[], v) => {
                const data = {
                    ...v.data,
                    id: v.ref.id,
                };
                a.push(data);
                return a;
            },
            [],
        );
        return items;
    }

    public async deleteFile({id, name, machine_id}) {
        const categories = await this.getGroupCategories({
            machine_id,
            recipe_process: RecipeProcessType.Recipe,
        });
        // console.log('categories', categories)
        // console.log('id', id)
        const category = categories.find(category => category.ref.id === id);
        if (category) {
            const updateCategory = (await category?.get()).data;
            const data = {
                ...updateCategory,
                media_resource: null,
            };
            await category.update(data);
            return {...data, id};
        }
        throw new Error('Can not find category. Wrong category ID');
    }
}
