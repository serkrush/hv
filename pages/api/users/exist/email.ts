import container from 'server/di/container';

export default container.resolve('UserController').handler('api/users/exist/email');

export const config = {
    api: {
        externalResolver: true,
    },
};