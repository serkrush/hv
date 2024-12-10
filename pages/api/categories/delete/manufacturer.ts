import container from 'server/di/container';

export default container
    .resolve('CategoryController')
    .handler('api/categories/delete/manufacturer');

export const config = {
    api: {
        externalResolver: true,
    },
};
