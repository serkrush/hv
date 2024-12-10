import container from 'server/di/container';

export default container
    .resolve('CategoryController')
    .handler('api/categories/delete/machine');

export const config = {
    api: {
        externalResolver: true
    }
}