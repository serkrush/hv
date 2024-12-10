import container from 'server/di/container';

export default container
    .resolve('UserController')
    .handler('api/users/fcm/remove');

export const config = {
    api: {
        externalResolver: true,
    },
};