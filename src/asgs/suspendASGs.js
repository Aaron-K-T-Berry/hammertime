const { AutoScalingClient, SuspendProcessesCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function suspendASGProcesses(asg) {
  const autoscaling = new AutoScalingClient({});
  const params = { AutoScalingGroupName: asg.AutoScalingGroupName };

  return retryWhenThrottled(() => autoscaling.send(new SuspendProcessesCommand(params)))
    .then(() => asg);
}

function suspendASGs(asgs) {
  const updatedASGs = asgs.map(asg => suspendASGProcesses(asg));
  return Promise.all(updatedASGs);
}

module.exports = suspendASGs;
