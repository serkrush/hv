import container from 'server/di/container';

export default container.resolve('MachineModelController').handler('api/machines/models/delete/file/:id/:name');

export const config = {
    api: {
        externalResolver: true,
    },
};
