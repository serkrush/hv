import {IZoneParams} from './ICycleModel';
import { IRecipeFavoritesModel } from './IRecipeFavoritesModel';

export enum IngridientAction {
    Ingredient = 'ingredient',
    Method = 'method',
}
export interface IngredientRecipe {
    action: IngridientAction;
    description: string;
    media_resource?: string;
}

export interface PresetParams {
    adjustment: number;
    marinated: number;
    thickness: number;
}
export interface IRecipeModel {
    id?: string;
    user_id?: string | null;
    machine_id?: string | null;
    machine_type: string;
    moisture: number;
    description: string;
    recipe_name: string;
    recipe_ingredients: IngredientRecipe[];
    recipe_process: string;
    type_session?: string;
    // stages: StageRecipe[];
    stages: IZoneParams[];
    categories: string[];
    base_thickness: number;
    media_resources: string[];

    temperature?: PresetParams;
    time?: PresetParams;
    uid?: string | null;
    search_terms?: string[];
    favoriteByUsers?: string[] | IRecipeFavoritesModel[]
    favoriteByMachines?: string[] | IRecipeFavoritesModel[]
}
