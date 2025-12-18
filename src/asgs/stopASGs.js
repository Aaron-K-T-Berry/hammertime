const { AutoScalingClient, UpdateAutoScalingGroupCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function spinDownASG(asg) {
  const autoscaling = new AutoScalingClient({});
  const params = {
    AutoScalingGroupName: asg.AutoScalingGroupName,
    DesiredCapacity: 0,
    MinSize: 0,
  };

  return retryWhenThrottled(() => autoscaling.send(new UpdateAutoScalingGroupCommand(params)))
    .then(() => asg);
}

function stopASGs(asgs) {
  const stoppedASGs = asgs.map(asg => spinDownASG(asg));
  return Promise.all(stoppedASGs);
}

module.exports = stopASGs;
