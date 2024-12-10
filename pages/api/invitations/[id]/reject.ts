import container from 'server/di/container';

export default container
    .resolve('InvitationController')
    .handler('api/invitations/:id/reject');

export const config = {
    api: {
        externalResolver: true,
    },
};
