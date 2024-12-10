import container from 'server/di/container';

export default container.resolve('RecipeController').handler('api/recipes/:id/user');

export const config = {
    api: {
        externalResolver: true,
    },
};