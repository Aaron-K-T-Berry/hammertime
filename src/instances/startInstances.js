const { EC2Client, StartInstancesCommand } = require('@aws-sdk/client-ec2');
const retryWhenThrottled = require("../utils/retryWhenThrottled");

function startInstances(instanceIds) {
  const ec2 = new EC2Client({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return retryWhenThrottled(() => ec2.send(new StartInstancesCommand({ InstanceIds: instanceIds })))
    .then(() => instanceIds);
}
module.exports = startInstances;
