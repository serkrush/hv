import container from 'server/di/container';

export default container
    .resolve('CategoryController')
    .handler('api/categories/save/manufacturer');

export const config = {
    api: {
        externalResolver: true,
    },
};
