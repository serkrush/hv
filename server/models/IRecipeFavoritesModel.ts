export enum FavoriteType {
    Bookmarked = 'bookmarked',
    Starred = 'starred',
}

export interface IRecipeFavoritesModel {
    id?: string;
    user_id: string;
    recipe_id: string;
    uid?: string;
    machine_id?: string;
    favorite_type: FavoriteType;
}
