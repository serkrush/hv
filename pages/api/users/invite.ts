import container from 'server/di/container';

export default container
    .resolve('InvitationController')
    .handler('api/users/invite');

export const config = {
    api: {
        externalResolver: true,
    },
};
