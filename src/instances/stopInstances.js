const { EC2Client, StopInstancesCommand } = require('@aws-sdk/client-ec2');

function stopInstances(instanceIds) {
  const ec2 = new EC2Client({});
  return ec2.send(new StopInstancesCommand({ InstanceIds: instanceIds }))
    .then(() => instanceIds);
}

module.exports = stopInstances;
