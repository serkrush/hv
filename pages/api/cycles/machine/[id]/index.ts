import container from 'server/di/container';

export default container
    .resolve('CycleController')
    .handler('api/cycles/machine/:id');

export const config = {
    api: {
        externalResolver: true,
    },
};
