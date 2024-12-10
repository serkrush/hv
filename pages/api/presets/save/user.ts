import container from 'server/di/container';

export default container
    .resolve('RecipeController')
    .handler('api/presets/save/user');

    
export const config = {
    api: {
        externalResolver: true,
    },
};