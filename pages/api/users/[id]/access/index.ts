import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/users/:id/access');

export const config = {
    api: {
        externalResolver: true,
    },
};
