import container from 'server/di/container';

export default container
    .resolve('UserController')
    .handler('api/users/add');

export const config = {
    api: {
        externalResolver: true,
    },
};