import container from 'server/di/container';

export default container
    .resolve('MachineController')
    .handler('api/machines/:id/groups');

export const config = {
    api: {
        externalResolver: true,
    },
};
