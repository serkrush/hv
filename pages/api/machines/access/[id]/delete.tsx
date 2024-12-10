import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/machines/access/:id/delete');

export const config = {
    api: {
        externalResolver: true,
    },
};
