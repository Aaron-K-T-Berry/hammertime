const { ECSClient, UntagResourceCommand } = require('@aws-sdk/client-ecs');
const retryWhenThrottled = require('../utils/retryWhenThrottled.js');

const untagService = (service) => {
  const ECS = new ECSClient({});
  const params = {
    tagKeys: [
      'hammertime:originalServiceSize',
      'stop:hammertime',
    ],
    resourceArn: service.serviceArn,
  };
  return retryWhenThrottled(() => ECS.send(new UntagResourceCommand(params))).then(() => service);
};

const untagServices = services => Promise.all(services.map(service => untagService(service)));

module.exports = untagServices;
