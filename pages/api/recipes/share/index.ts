import container from 'server/di/container';

export default container
    .resolve('RecipeController')
    .handler('api/recipes/share');
