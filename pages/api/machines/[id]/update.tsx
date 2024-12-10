import container from 'server/di/container';

export default container
    .resolve('MachineController')
    .handler('api/machines/:id/update');

export const config = {
    api: {
        externalResolver: true,
    },
};
