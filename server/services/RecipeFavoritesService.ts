import BaseContext from 'server/di/BaseContext';
import {IRecipeFavoritesModel} from '../models/IRecipeFavoritesModel';
import {Cacher, ErrorCode} from '@/src/constants';
import {groups} from 'typesaurus';
import { IRecipeModel } from '../models/IRecipeModel';

export default class RecipeFavoritesService extends BaseContext {
    public async saveMachine(data: IRecipeFavoritesModel) {

        const {Recipes} = this.di;
        const isGlobal = !!(await Recipes.query($ => $.field('id').eq(data?.recipe_id)))[0]
        if(data?.machine_id && !data?.user_id) {
            if(!isGlobal) {
                return await this.saveAsMachine(data);
            }
            return await this.saveAsRoot(data)
        }
    }

    public async saveUser(data: IRecipeFavoritesModel) {
        const {Recipes} = this.di;
        const isGlobal = !!(await Recipes.query($ => $.field('id').eq(data?.recipe_id)))[0]
        if(!data?.machine_id && data?.user_id) {
            if(!isGlobal) {
                return await this.saveAsUser(data);
            }
            return await this.saveAsRoot(data)
        }
    }

    public async saveAsMachine(
        data: IRecipeFavoritesModel,
    ): Promise<IRecipeFavoritesModel> {
        const {
            Machines,
            firebase: {schema},
        } = this.di;
        const machineId = (await Machines.query($ => $.field('guid').eq(data?.machine_id)))[0].ref.id;
        if (machineId && data?.recipe_id) {
            const ref = schema.machines(Machines.id(machineId));
            const recipe = await ref.recipes.get(data?.recipe_id as any);
            if(recipe){
                return await this.updateFavoritesByMachines(recipe, data)
            }
            
        }
        throw new Error('Recipe or machine was not found')
    }

    public async saveAsUser(
        data: IRecipeFavoritesModel,
    ): Promise<IRecipeFavoritesModel> {
        const {
            Users,
            firebase: {schema},
        } = this.di;
        if (data.user_id) {
            const ref = schema.users(Users.id(data.user_id));
            const recipe = await ref.recipes.get(data?.recipe_id as any);
            if(recipe){
                return await this.updateFavoritesByUsers(recipe, data)
            }
        } else {
            throw new Error('ErrorCode.NoUser');
        }
    }

    public async saveAsRoot(
        data: IRecipeFavoritesModel,
    ) {        
        const {
            Recipes
        } = this.di;
        const recipe = (await Recipes.query($ => $.field('id').eq(data.recipe_id)))[0]
        if(recipe) {
            await this.updateInCache(data);
            if(data?.user_id) {
                return await this.updateFavoritesByUsers(recipe, data)
            }
            else if(data?.machine_id) {
                return await this.updateFavoritesByMachines(recipe, data)
            }
        }
        else {
            throw new Error('no-recipes');
        }
    }

    public async updateInCache(data) {
        const {
            cacher
        } = this.di;
        let items: IRecipeModel[] = await cacher.getCache(Cacher.AllGlobalRecipes);
        if(items) {
            const oldRecipeIndex = items?.findIndex(item => item?.id === data?.recipe_id)
            if(oldRecipeIndex !== -1) {
                const oldRecipe = items[oldRecipeIndex];
                if(data?.user_id) {
                    let favoriteByUsers = []
                    if(!data.favorite_type) {
                        favoriteByUsers = 
                        oldRecipe?.favoriteByUsers ? 
                            oldRecipe?.favoriteByUsers.filter(item => item !== data.user_id) : []
                    } else {
                        favoriteByUsers = oldRecipe?.favoriteByUsers ? Array.from(new Set([...oldRecipe?.favoriteByUsers, data.user_id])) : [data?.user_id];
                    }
                    items[oldRecipeIndex] = {
                        ...oldRecipe,
                        favoriteByUsers
                    }
                }
                else if(data?.machine_id) {
                    let favoriteByMachines = []
                    if(!data.favorite_type) {
                        favoriteByMachines = 
                        oldRecipe?.favoriteByMachines ? 
                            oldRecipe?.favoriteByMachines.filter(item => item !== data.machine_id) : []
                    } else {
                        favoriteByMachines = oldRecipe?.favoriteByMachines ? Array.from(new Set([...oldRecipe?.favoriteByMachines, data.machine_id])) : [data?.machine_id];
                    }
                    items[oldRecipeIndex] = {
                        ...oldRecipe,
                        favoriteByMachines
                    }
                }
                await cacher.saveCache(Cacher.AllGlobalRecipes, items);
            }
        }
    }


    public async updateFavoritesByUsers(recipe, data) {
        let favoriteByUsers = []
        if(!data.favorite_type) {
            favoriteByUsers = 
        recipe?.data?.favoriteByUsers ? 
            recipe?.data?.favoriteByUsers.filter(item => item !== data.user_id) : []
        } else {
            favoriteByUsers = recipe?.data?.favoriteByUsers ? Array.from(new Set([...recipe?.data?.favoriteByUsers, data.user_id])) : [data?.user_id];
        }
        await recipe.set({
            ...recipe.data,
            favoriteByUsers
        })
        const updateRecipe = await recipe?.get();
        if(data.favorite_type) {
            return {
                id: updateRecipe.ref.id,
                favorite_type: data.favorite_type,
                recipe_id: updateRecipe.ref.id,
                machine_id: null,
                user_id: data?.user_id
            }
        }
        return {
            id: updateRecipe.ref.id,
            favorite_type: null,
            recipe_id: updateRecipe.ref.id,
            machine_id: null,
            user_id: data?.user_id
        }
    }

    public async updateFavoritesByMachines(recipe, data) {
        let favoriteByMachines = []
        if(!data.favorite_type) {
            favoriteByMachines = 
                recipe?.data?.favoriteByMachines ? 
                    recipe?.data?.favoriteByMachines.filter(item => item !== data.machine_id) : []
        } else {
            favoriteByMachines = recipe?.data?.favoriteByMachines ? Array.from(new Set([...recipe?.data?.favoriteByMachines, data.machine_id])) : [data?.machine_id];
        }
        await recipe.set({
            ...recipe.data,
            favoriteByMachines
        })
        const updateRecipe = await recipe?.get();
        if(data.favorite_type) {
            return {
                id: updateRecipe.ref.id,
                favorite_type: data.favorite_type,
                recipe_id: updateRecipe.ref.id,
                machine_id: data?.machine_id,
                user_id: null
            }
        }
        return {
            id: updateRecipe.ref.id,
            favorite_type: null,
            recipe_id: updateRecipe.ref.id,
            machine_id: data?.machine_id,
            user_id: null
        }
    }
}
