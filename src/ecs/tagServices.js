const { ECSClient, TagResourceCommand } = require('@aws-sdk/client-ecs');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function tagService(service) {
  const ECS = new ECSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  const params = {
    resourceArn: service.serviceArn,
    tags: [
      { key: 'hammertime:originalServiceSize', value: service.desiredCount.toString() },
      { key: 'stop:hammertime', value: new Date().toISOString() },
    ],
  };
  return retryWhenThrottled(() => ECS.send(new TagResourceCommand(params))).then(() => service);
}

function tagServices(services) {
  return Promise.all(services.map(service => tagService(service)));
}

module.exports = tagServices;
