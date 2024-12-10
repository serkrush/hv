import container from 'server/di/container';

export default container.resolve('UserController').handler('api/users/machines/:id/accesses');

export const config = {
    api: {
        externalResolver: true,
    },
};