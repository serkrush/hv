import container from 'server/di/container';

export default container
    .resolve('InvitationController')
    .handler('api/recipes/invite');
