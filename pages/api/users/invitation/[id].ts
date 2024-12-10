import container from 'server/di/container';

export default container.resolve('UserController').handler('api/users/invitation/:id');

export const config = {
    api: {
        externalResolver: true,
    },
};