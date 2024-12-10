export enum RecipeProcessType {
  Recipe = "recipe",
  Preset = "preset",
}

export interface ICategoryModel {
  id?: string;
  user_id: string | null;
  category_name: string;
  recipe_process?: RecipeProcessType | undefined | null;
  categories?: ICategoryModel[];
  parent_id?: string;
  parentIds?: string[] | undefined;
  machine_id?: string | null;
  uid?: string | null;
}