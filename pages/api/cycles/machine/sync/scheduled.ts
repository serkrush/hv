import container from 'server/di/container';

export default container
    .resolve('CycleController')
    .handler('api/cycles/machine/sync/scheduled');

export const config = {
    api: {
        externalResolver: true,
    },
};
