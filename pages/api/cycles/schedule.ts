import container from 'server/di/container';

export default container
    .resolve('CycleController')
    .handler('api/cycles/schedule');

export const config = {
    api: {
        externalResolver: true,
    },
};
