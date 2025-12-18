const { ECSClient, UpdateServiceCommand } = require('@aws-sdk/client-ecs');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function spinDownService(service) {
  const ECS = new ECSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  const params = {
    cluster: service.clusterArn,
    service: service.serviceArn,
    desiredCount: 0,
  };
  return retryWhenThrottled(() => ECS.send(new UpdateServiceCommand(params))).then(() => service);
}

function stopServices(services) {
  return Promise.all(services.map(service => spinDownService(service)));
}

module.exports = stopServices;
