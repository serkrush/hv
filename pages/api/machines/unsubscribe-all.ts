import container from 'server/di/container';

export default container
    .resolve('MachineController')
    .handler('api/machines/unsubscribe-all');

export const config = {
    api: {
        externalResolver: true,
    },
};
