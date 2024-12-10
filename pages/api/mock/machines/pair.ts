import container from 'server/di/container';

export default container
    .resolve('MockController')
    .handler('api/mock/machines/pair');
