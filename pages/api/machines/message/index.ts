import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/machines/message');

export const config = {
    api: {
        externalResolver: true,
    },
};
