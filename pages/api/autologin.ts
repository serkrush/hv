import container from 'server/di/container';

export default container.resolve('AuthController').handler('api/autologin');

export const config = {
    api: {
        externalResolver: true,
    },
};
