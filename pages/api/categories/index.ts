import container from 'server/di/container';

export default container
    .resolve('CategoryController')
    .handler('api/categories');

export const config = {
    api: {
        externalResolver: true,
    },
};
