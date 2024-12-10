import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/machines/access/:id/update');

export const config = {
    api: {
        externalResolver: true,
    },
};
