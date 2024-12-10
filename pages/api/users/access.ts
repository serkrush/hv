import container from 'server/di/container';

export default container.resolve('UserController').handler('api/users/access');

export const config = {
    api: {
        externalResolver: true,
    },
};