import container from 'server/di/container';

export default container
    .resolve('MachineController')
    .handler('api/machines/statuses');

export const config = {
    api: {
        externalResolver: true,
    },
};
