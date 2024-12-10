import container from 'server/di/container';

export default container
    .resolve('CycleController')
    .handler('api/cycles/:id/delete');

export const config = {
    api: {
        externalResolver: true,
    },
};
