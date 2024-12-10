import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/users/:id/access/machines/groups');

export const config = {
    api: {
        externalResolver: true,
    },
};
