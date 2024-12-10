import container from 'server/di/container';

export default container.resolve('RecipeController').handler('api/presets/:id');

export const config = {
    api: {
        externalResolver: true,
    },
};
