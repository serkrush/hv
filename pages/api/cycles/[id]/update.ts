import container from 'server/di/container';

export default container
    .resolve('CycleController')
    .handler('api/cycles/:id/update');

export const config = {
    api: {
        externalResolver: true,
    },
};
