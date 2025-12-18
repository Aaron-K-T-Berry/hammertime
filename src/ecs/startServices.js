const { ECSClient, UpdateServiceCommand } = require('@aws-sdk/client-ecs');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function startService(service) {
  const ECS = new ECSClient({});
  const originalServiceSize = service.tags.find(tag => tag.key === 'hammertime:originalServiceSize').value;
  const params = {
    cluster: service.clusterArn,
    service: service.serviceArn,
    desiredCount: originalServiceSize,
  };
  return retryWhenThrottled(() => ECS.send(new UpdateServiceCommand(params))).then(() => service);
}

function startServices(services) {
  return Promise.all(services.map(service => startService(service)));
}

module.exports = startServices;
