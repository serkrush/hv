import container from 'server/di/container';

export default container
    .resolve('MachineGroupController')
    .handler('api/machines/groups/:id/delete');

export const config = {
    api: {
        externalResolver: true,
    },
};
