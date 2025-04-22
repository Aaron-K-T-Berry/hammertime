// comments
const AWS = require('aws-sdk');

async function deletePuppetLockIfExists(instanceId) {
  const ssm = new AWS.SSM();
  const command = 'if [ -f /tmp/puppet.lockfile ]; then rm -f /tmp/puppet.lock; fi';

  // Send the command to the instance
  const sendCommandResponse = await ssm.sendCommand({
    InstanceIds: [instanceId],
    DocumentName: 'AWS-RunShellScript',
    Parameters: {
      commands: [command],
    },
  }).promise();

  const commandId = sendCommandResponse.Command.CommandId;

  // Wait for the command to complete
  let commandStatus = 'InProgress';
  while (commandStatus === 'InProgress') {
    const commandInvocation = await ssm.getCommandInvocation({
      CommandId: commandId,
      InstanceId: instanceId,
    }).promise();

    commandStatus = commandInvocation.Status;
    if (commandStatus === 'InProgress') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
    }
  }

  if (commandStatus !== 'Success') {
    throw new Error(`Failed to delete /tmp/puppet.lockfile on instance ${instanceId}`);
  }
}

async function stopInstances(instanceIds) {
  const ec2 = new AWS.EC2();

  for (const instanceId of instanceIds) {
    try {
      await deletePuppetLockIfExists(instanceId);
    } catch (error) {
      console.error(`Error deleting /tmp/puppet.lock on instance ${instanceId}:`, error.message);
    }
  }

  return ec2.stopInstances({ InstanceIds: instanceIds })
    .promise()
    .then(() => instanceIds);
}

module.exports = stopInstances;