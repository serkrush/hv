import container from 'server/di/container';

export default container
    .resolve('MachineModelController')
    .handler('api/machines/models/:id');

export const config = {
    api: {
        externalResolver: true,
    },
};
