const { EC2Client, StopInstancesCommand } = require('@aws-sdk/client-ec2');

function stopInstances(instanceIds) {
  const ec2 = new EC2Client({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return ec2.send(new StopInstancesCommand({ InstanceIds: instanceIds }))
    .then(() => instanceIds);
}

module.exports = stopInstances;
