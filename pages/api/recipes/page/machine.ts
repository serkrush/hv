import container from 'server/di/container';

export default container
    .resolve('RecipeController')
    .handler('api/recipes/page/machine');

export const config = {
    api: {
        externalResolver: true,
    },
};
