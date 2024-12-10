import container from 'server/di/container';

export default container.resolve('MachineModelController').handler('api/machines/models/save');

export const config = {
    api: {
        externalResolver: true,
    },
};
