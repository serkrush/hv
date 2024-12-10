import {Cacher, DEFAULT_PER_PAGE, ErrorCode} from '@/src/constants';
import {IPagerParams} from '@/src/pagination/IPagerParams';
import {DocumentData, Query} from '@google-cloud/firestore';
import BaseContext from 'server/di/BaseContext';
import {groups} from 'typesaurus';
import {FavoriteType} from '../models/IRecipeFavoritesModel';
import {IRecipeModel} from '../models/IRecipeModel';
import {createSearchTerms} from '../utils/createSearchTerms';

export default class RecipeService extends BaseContext {
    /**
     * getRecipes
     */
    public async getRecipes() {
        const {Recipes} = this.di;
        const recipes = await Recipes.all();
        return recipes.map(recipe => {
            return {...recipe.data, id: recipe.ref.id};
        });
    }

    /**
     * page
     */
    public async page(pager: IPagerParams, userId?: string | undefined) {
        const {
            Recipes,
            firebase: {firestore},
        } = this.di;
        const {page, perPage, lastDocumentId} = pager;
        let sortField = pager?.sort?.field;
        let sortOrder: 'asc' | 'desc' =
            pager?.sort?.sort === -1 ? 'desc' : 'asc';

        let query: Query<DocumentData> = firestore.collection('recipes');
        if (sortField) {
            query = query.orderBy(sortField, sortOrder);
        }

        if (Object.keys(pager.filter).length > 0) {
            if (pager.filter.categories?.length > 0) {
                query = query.where(
                    'categories',
                    'array-contains-any',
                    pager.filter.categories,
                );
            }
            if (pager.filter.recipe_process) {
                query = query.where(
                    'recipe_process',
                    '==',
                    pager.filter.recipe_process,
                );
            }
            if (pager.filter.type_session) {
                query = query.where(
                    'type_session',
                    '==',
                    pager.filter.type_session,
                );
            }
            if (pager.filter.user_id) {
                query = query.where('user_id', '==', pager.filter.user_id);
            }
            if (pager.filter.recipe_name) {
                const searchTerms = createSearchTerms(pager.filter.recipe_name);
                query = query.where(
                    'search_terms',
                    'array-contains-any',
                    searchTerms,
                );
            }
            if (pager.filter.favorite_type) {
                if (pager.filter.uid) {
                    query = query.where(
                        'favoriteByMachines',
                        'array-contains',
                        pager.filter.uid,
                    );
                } else if (userId) {
                    query = query.where(
                        'favoriteByUsers',
                        'array-contains',
                        userId,
                    );
                }
            }
        }
        let count = (await query.get()).docs.length;
        if (lastDocumentId) {
            const afterDocument = await firestore
                .collection('recipes')
                .doc(lastDocumentId)
                .get();
            query = query.startAfter(afterDocument);
        }

        const items = await query.limit(perPage ?? DEFAULT_PER_PAGE).get();

        let res = items.docs.map(item => {
            const recipeData = item.data() as IRecipeModel;
            let data = {...recipeData, id: item.ref.id};
            if (pager.filter.uid) {
                const favoriteByMachines =
                    data?.favoriteByMachines?.length &&
                    data?.favoriteByMachines?.includes(pager?.filter?.uid)
                        ? [
                              {
                                  id: item.ref.id,
                                  user_id: null,
                                  recipe_id: item.ref.id,
                                  machine_id: pager.filter.uid,
                                  favorite_type: FavoriteType.Bookmarked,
                              },
                          ]
                        : [];
                data = {...data, favoriteByMachines, favoriteByUsers: []};
            } else if (userId) {
                const favoriteByUsers =
                    data?.favoriteByUsers?.length &&
                    data?.favoriteByUsers?.includes(userId as any)
                        ? [
                              {
                                  id: item.ref.id,
                                  user_id: userId,
                                  recipe_id: item.ref.id,
                                  machine_id: null,
                                  favorite_type: FavoriteType.Bookmarked,
                              },
                          ]
                        : [];
                data = {...data, favoriteByUsers, favoriteByMachines: []};
            }
            return data;
        });
        return {
            items: res,
            count,
        };
    }

    /**
     * pageCached
     */
    public async pageCached(pager: IPagerParams, userId?: string | undefined) {
        const {
            cacher,
            firebase: {firestore},
        } = this.di;

        let items: any[] = await cacher.getCache(Cacher.AllGlobalRecipes);
        if (!items) {
            let sortField = pager?.sort?.field;
            let sortOrder: 'asc' | 'desc' =
                pager?.sort?.sort === -1 ? 'desc' : 'asc';
            let query: Query<DocumentData> = firestore.collection('recipes');
            if (sortField) {
                query = query.orderBy(sortField, sortOrder);
            }
            const recipes = await firestore.collection('recipes').get();
            items = recipes.docs.map(item => ({
                ...item.data(),
                id: item.ref.id,
            }));
            await cacher.saveCache(Cacher.AllGlobalRecipes, items);
        }

        if (Object.keys(pager.filter).length > 0) {
            if (pager.filter.categories?.length > 0) {
                items = items.filter(recipe =>
                    recipe.categories?.some(category =>
                        pager.filter.categories.includes(category),
                    ),
                );
            }
            if (pager.filter.recipe_process) {
                items = items.filter(
                    recipe =>
                        recipe?.recipe_process === pager.filter.recipe_process,
                );
            }
            if (pager.filter.type_session) {
                items = items.filter(
                    recipe =>
                        recipe?.type_session === pager.filter.type_session,
                );
            }
            if (pager.filter.user_id) {
                items = items.filter(
                    recipe => recipe?.user_id === pager.filter.user_id,
                );
            }
            if (pager.filter.recipe_name) {
                items = items.filter(recipe =>
                    recipe?.recipe_name?.includes(pager.filter.recipe_name),
                );
            }
            if (pager.filter.favorite_type) {
                if (pager.filter.uid) {
                    items = items.filter(recipe =>
                        recipe?.favoriteByMachines?.includes(pager.filter.uid),
                    );
                } else if (userId) {
                    items = items.filter(recipe =>
                        recipe?.favoriteByUsers?.includes(userId as any),
                    );
                }
            }
        }

        const startIndex = (pager.page - 1) * pager.perPage;
        const endIndex = startIndex + pager.perPage;
        let paginatedRes = items.slice(startIndex, endIndex);

        paginatedRes = paginatedRes.map(data => {
            if (pager.filter.uid) {
                const favoriteByMachines =
                    data?.favoriteByMachines?.length &&
                    data?.favoriteByMachines?.includes(pager?.filter?.uid)
                        ? [
                              {
                                  id: data.id,
                                  user_id: null,
                                  recipe_id: data.id,
                                  machine_id: pager.filter.uid,
                                  favorite_type: FavoriteType.Bookmarked,
                              },
                          ]
                        : [];
                data = {...data, favoriteByMachines, favoriteByUsers: []};
            } else if (userId) {
                const favoriteByUsers =
                    data?.favoriteByUsers?.length &&
                    data?.favoriteByUsers?.includes(userId as any)
                        ? [
                              {
                                  id: data.id,
                                  user_id: userId,
                                  recipe_id: data.id,
                                  machine_id: null,
                                  favorite_type: FavoriteType.Bookmarked,
                              },
                          ]
                        : [];
                data = {...data, favoriteByUsers, favoriteByMachines: []};
            }
            return data;
        });

        return {
            items: paginatedRes,
            count: items.length, //count,
        };
    }

    public async pageMachine(pager: IPagerParams) {
        if (pager.filter.uid) {
            const {page, perPage, lastDocumentId} = pager;
            const {
                Machines,
                firebase: {schema, firestore},
            } = this.di;
            const machines = await Machines.query($ =>
                $.field('guid').eq(pager.filter.uid),
            );
            if (machines?.length > 0) {
                const query = [];
                query.push(_ => _.field('machine_id').eq(machines[0].ref.id));
                query.push(_ => _.field('user_id').eq(null));
                if (Object.keys(pager.filter).length > 0) {
                    if (pager.filter.categories?.length > 0) {
                        query.push(_ =>
                            _.field('categories').containsAny(
                                pager.filter.categories,
                            ),
                        );
                    }
                    if (pager.filter.recipe_process) {
                        query.push(_ =>
                            _.field('recipe_process').eq(
                                pager.filter.recipe_process,
                            ),
                        );
                    }
                    if (pager.filter.recipe_name) {
                        const searchTerms = createSearchTerms(
                            pager.filter.recipe_name,
                        );
                        query.push(_ =>
                            _.field('search_terms').containsAny(searchTerms),
                        );
                    }
                    if (pager.filter.favorite_type && pager.filter.uid) {
                        query.push(_ =>
                            _.field('favoriteByMachines').contains(
                                pager.filter.uid,
                            ),
                        );
                    }
                }
                const totalDocuments = await groups(schema).recipes.query($ =>
                    query.map(cond => cond($)),
                );
                const count = totalDocuments.length;

                if (lastDocumentId) {
                    const afterDocument = await firestore
                        .collection(`machines/${machines[0].ref.id}/recipes`)
                        .doc(lastDocumentId)
                        .get();
                    if (!afterDocument.exists) {
                        throw new Error('ErrorCode.InvalidLastDocument');
                    }
                    query.push(_ => _.startAfter(afterDocument));
                }
                query.push(_ => _.limit(perPage ?? DEFAULT_PER_PAGE));

                const items = await groups(schema).recipes.query($ =>
                    query.map(cond => cond($)),
                );

                let res = items.map(item => {
                    const recipeData = item.data;
                    let data = {...recipeData, id: item.ref.id};
                    const favoriteByMachines =
                        data?.favoriteByMachines?.length &&
                        data?.favoriteByMachines?.includes(pager.filter.uid)
                            ? [
                                  {
                                      id: item.ref.id,
                                      user_id: null,
                                      recipe_id: item.ref.id,
                                      machine_id: pager.filter.uid,
                                      favorite_type: FavoriteType.Starred,
                                  },
                              ]
                            : [];
                    data = {...data, favoriteByMachines, favoriteByUsers: []};
                    return data;
                });
                return {
                    items: res,
                    count,
                };
            }
        } else {
            throw new Error('ErrorCode.NoRecipeForId');
        }
    }
    public async pageUser(pager: IPagerParams, userId: string) {
        const {
            firebase: {schema, firestore},
        } = this.di;
        const query = [];
        const {page, perPage, lastDocumentId} = pager;
        query.push(_ => _.field('machine_id').eq(null));
        query.push(_ => _.field('user_id').eq(userId));
        if (Object.keys(pager.filter).length > 0) {
            if (pager.filter.categories?.length > 0) {
                query.push(_ =>
                    _.field('categories').containsAny(pager.filter.categories),
                );
            }
            if (pager.filter.recipe_process) {
                query.push(_ =>
                    _.field('recipe_process').eq(pager.filter.recipe_process),
                );
            }
            if (pager.filter.recipe_name) {
                const searchTerms = createSearchTerms(pager.filter.recipe_name);
                query.push(_ =>
                    _.field('search_terms').containsAny(searchTerms),
                );
            }
            if (pager.filter.favorite_type && userId) {
                query.push(_ => _.field('favoriteByUsers').contains(userId));
            }
        }
        const totalDocuments = await groups(schema).recipes.query($ =>
            query.map(cond => cond($)),
        );
        const count = totalDocuments.length;

        if (lastDocumentId) {
            const afterDocument = await firestore
                .collection(`users/${userId}/recipes`)
                .doc(lastDocumentId)
                .get();
            if (!afterDocument.exists) {
                throw new Error('ErrorCode.InvalidLastDocument');
            }
            query.push(_ => _.startAfter(afterDocument));
        }
        query.push(_ => _.limit(perPage ?? DEFAULT_PER_PAGE));

        const items = await groups(schema).recipes.query($ =>
            query.map(cond => cond($)),
        );

        let res = items.map(item => {
            const recipeData = item.data;
            let data = {...recipeData, id: item.ref.id};
            const favoriteByUsers =
                data?.favoriteByUsers?.length &&
                data?.favoriteByUsers?.includes(userId as any)
                    ? [
                          {
                              id: item.ref.id,
                              user_id: userId,
                              recipe_id: item.ref.id,
                              machine_id: null,
                              favorite_type: FavoriteType.Starred,
                          },
                      ]
                    : [];
            data = {...data, favoriteByUsers, favoriteByMachines: []};
            return data;
        });
        return {
            items: res,
            count,
        };
    }

    /**
     * findRecipeInfo
     */
    public async findRecipeInfo(recipeId: string) {
        const {Recipes} = this.di;
        const recipe = await Recipes.get(Recipes.id(recipeId));
        if (recipe) {
            return {...recipe.data, id: recipe.ref.id};
        } else {
            throw new Error(ErrorCode.NoRecipeForId);
        }
    }

    public async findRecipeMachineInfo(recipeId: string, uid: string) {
        if (uid) {
            const {
                Machines,
                firebase: {schema},
            } = this.di;
            const machines = await Machines.query($ => $.field('guid').eq(uid));
            const recipes = await this.getGroupRecipes({
                machine_id: machines[0].ref.id,
            });
            if (recipes?.length > 0) {
                const recipe = recipes.filter(
                    recipe => recipe.ref.id === recipeId,
                );
                if (recipe?.length > 0) {
                    return {...recipe[0].data, id: recipe[0].ref.id};
                } else {
                    throw new Error(ErrorCode.NoRecipeForId);
                }
            } else {
                throw new Error(ErrorCode.NoRecipeForId);
            }
        }
    }

    public async findRecipeUserInfo(recipeId: string, userId: string) {
        const recipes = await this.getGroupRecipes({
            user_id: userId,
        });
        if (recipes?.length > 0) {
            const recipe = recipes.filter(recipe => recipe.ref.id === recipeId);
            if (recipe?.length > 0) {
                return {...recipe[0].data, id: recipe[0].ref.id};
            } else {
                throw new Error(ErrorCode.NoRecipeForId);
            }
        } else {
            throw new Error(ErrorCode.NoRecipeForId);
        }
    }

    /**
     * saveToRoot
     */
    public saveToRoot(data: IRecipeModel): Promise<IRecipeModel> {
        const {schema} = this.di.firebase;
        this.di.cacher.deleteCache(Cacher.AllGlobalRecipes);
        return this.saveRecipe(schema, data);
    }
    /**
     * saveToUser
     */
    public saveToUser(data: IRecipeModel): Promise<IRecipeModel> {
        const {
            Users,
            firebase: {schema},
        } = this.di;
        if (data.user_id) {
            return this.saveRecipe(schema.users(Users.id(data.user_id)), data);
        }
    }
    public async saveToUserShareRecipe(
        data: IRecipeModel,
        folder: string,
    ): Promise<IRecipeModel> {
        const {
            firebase: {schema, storage},
        } = this.di;
        if (data.user_id) {
            const res = await this.saveToUser(data);
            this.copyFolder(`recipes/${folder}`, `recipes/${data.id}`);
            return res;
        }
    }

    public async copyFolder(folder1: string, folder2: string) {
        try {
            const {firebase} = this.di;
            const bucket = firebase.storage.bucket();
            const [files] = await bucket.getFiles({prefix: folder1});
            const copyPromises = files.map(async file => {
                const filePath = file.name;
                const relativePath = filePath.replace(folder1, '');
                const destinationPath = `${folder2}${relativePath}`;

                await file.copy(destinationPath);
            });

            await Promise.all(copyPromises);
            console.log(`Folder ${folder1} successfully copied to ${folder2}`);
        } catch (error) {
            console.error(
                `Error copying folder from ${folder1} to ${folder2}:`,
                error,
            );
            throw error;
        }
    }
    /**
     * saveToMachine
     */
    public async saveToMachine(data: IRecipeModel): Promise<IRecipeModel> {
        const {
            Machines,
            firebase: {schema},
        } = this.di;
        let fData = data;
        if (!data.machine_id && data.uid) {
            const {uid, ...restData} = data;
            const machines = await Machines.query($ => $.field('guid').eq(uid));
            fData = {
                ...restData,
                machine_id: machines[0].ref.id,
            };
        }
        if (fData.machine_id) {
            return this.saveRecipe(
                schema.machines(Machines.id(fData.machine_id)),
                fData,
            );
        }
    }

    /**
     * saveRecipe
     */
    public async saveRecipe(
        ref: any,
        data: IRecipeModel,
    ): Promise<IRecipeModel> {
        const recipes = await this.getGroupRecipes(data);
        console.log('saveRecipe recipes', recipes);
        const recipe = recipes.find(recipe => recipe.ref.id === data.id);
        console.log('saveRecipe recipe ----> ', recipe);

        if (recipe) {
            return this.updateRecipe(data);
        } else {
            return this.addRecipe(data, ref);
        }
    }

    private async updateRecipe(data: IRecipeModel): Promise<IRecipeModel> {
        const recipes = await this.getGroupRecipes(data);
        const recipe = recipes.find(recipe => recipe.ref.id === data.id);
        if (recipe) {
            if (data?.recipe_name) {
                data.recipe_name = data.recipe_name?.trim();
                data.search_terms = createSearchTerms(data.recipe_name);
            }
            if (!data?.favoriteByMachines) {
                data.favoriteByMachines = [];
            }
            if (!data?.favoriteByUsers) {
                data.favoriteByUsers = [];
            }
            await recipe.update(data);
            const updateRecipe = await recipe?.get();
            return {...updateRecipe?.data, id: updateRecipe?.ref.id};
        }
        throw new Error('Can not update recipe. Wrong recipe ID');
    }

    private async addRecipe(data: IRecipeModel, ref: any) {
        if (data?.recipe_name) {
            data.recipe_name = data.recipe_name?.trim();
            data.search_terms = createSearchTerms(data.recipe_name);
        }
        if (!data?.favoriteByMachines) {
            data.favoriteByMachines = [];
        }
        if (!data?.favoriteByUsers) {
            data.favoriteByUsers = [];
        }
        const res = await ref.recipes.set(data.id, data);
        const newRecipe = await res.get();
        return {...newRecipe?.data, id: newRecipe?.ref.id};
    }

    private async getGroupRecipes(data) {
        const {schema} = this.di.firebase;
        return await groups(schema).recipes.query($ => [
            $.field('user_id').eq(data.user_id ?? null),
            $.field('machine_id').eq(data.machine_id ?? null),
        ]);
    }

    /**
     * deleteRecipe
     */
    public async deleteRecipe(data) {
        const {id} = data;
        const recipes = await this.getGroupRecipes(data);

        const recipe = recipes.find(recipe => recipe.ref.id === id);
        const recipeData = recipe.data;
        const recipeId = recipe.ref.id;
        const recipeDeleted = await recipe?.get();
        await recipeDeleted?.remove();
        if (
            recipeData?.favoriteByMachines &&
            recipeData?.favoriteByMachines.length &&
            recipeData?.machine_id
        ) {
            return {
                id,
                favoriteByMachines: [
                    {
                        id: recipeId,
                        user_id: null,
                        recipe_id: recipeId,
                        machine_id: recipeData?.machine_id,
                        favorite_type: null,
                    },
                ],
            };
        } else if (
            recipeData?.favoriteByUsers &&
            recipeData?.favoriteByUsers.length &&
            recipeData?.user_id
        ) {
            return {
                id,
                favoriteByUsers: [
                    {
                        id: recipeId,
                        user_id: recipeData?.user_id,
                        recipe_id: recipeId,
                        machine_id: null,
                        favorite_type: null,
                    },
                ],
            };
        }
        return {id};
    }

    public async deleteFile({id, name, uid = null}) {
        const {Machines} = this.di;
        let query = {};
        if (uid) {
            const machines = await Machines.query($ => $.field('guid').eq(uid));
            if (machines?.length === 0) {
                throw new Error('Can not find machine. Wrong machine ID');
            }
            query = {machine_id: machines[0].ref.id};
        }
        const recipes = await this.getGroupRecipes(query);
        const recipe = recipes.find(recipe => recipe.ref.id === id);
        if (recipe) {
            const updateRecipe = (await recipe?.get()).data;
            const new_media_resources = updateRecipe.media_resources.filter(
                media => media !== name,
            );
            const data = {
                ...updateRecipe,
                media_resources: new_media_resources,
            };
            await recipe.update(data);
            return {...data, id};
        }
        throw new Error('Can not find recipe. Wrong recipe ID');
    }

    public async deleteMethodFile({id, name, uid = null}) {
        const {Machines} = this.di;
        let query = {};
        if (uid) {
            const machines = await Machines.query($ => $.field('guid').eq(uid));
            if (machines?.length === 0) {
                throw new Error('Can not find machine. Wrong machine ID');
            }
            query = {machine_id: machines[0].ref.id};
        }
        const recipes = await this.getGroupRecipes(query);
        const recipe = recipes.find(recipe => recipe.ref.id === id);
        if (recipe) {
            const updateRecipe = (await recipe?.get()).data;
            const updatedIngredients = updateRecipe.recipe_ingredients.map(
                ingredient => {
                    if (ingredient.media_resource === name) {
                        const {media_resource, ...rest} = ingredient;
                        return rest;
                    }
                    return ingredient;
                },
            );
            const data = {
                ...updateRecipe,
                recipe_ingredients: updatedIngredients,
            };
            await recipe.update(data);
            return {...data, id};
        }
        throw new Error('Can not find recipe. Wrong recipe ID');
    }

    public async getRecipesByMachine(uid: string) {
        const {Machines} = this.di;
        let query = {};
        const machines = await Machines.query($ => $.field('guid').eq(uid));
        if (machines?.length === 0) {
            throw new Error('Can not find machine. Wrong machine ID');
        }
        query = {machine_id: machines[0].ref.id};
        const recipes = await this.getGroupRecipes(query);
        return recipes.map(item => ({...item?.data, id: item?.ref.id}));
    }
}
