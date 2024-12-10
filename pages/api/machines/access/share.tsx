import container from 'server/di/container';

export default container
    .resolve('MachinesAccessController')
    .handler('api/machines/access/share');

export const config = {
    api: {
        externalResolver: true,
    },
};
