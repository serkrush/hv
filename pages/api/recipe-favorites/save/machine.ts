import container from 'server/di/container';

export default container
    .resolve('RecipeFavoritesController')
    .handler('api/recipe-favorites/save/machine');

export const config = {
    api: {
        externalResolver: true,
    },
};
