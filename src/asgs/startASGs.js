const { AutoScalingClient, UpdateAutoScalingGroupCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');
const valueForKey = require('../utils/valueForKey');

function spinUpASG(asg) {
  const autoscaling = new AutoScalingClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  const originalASGSize = valueForKey(asg.Tags, 'hammertime:originalASGSize').split(',');
  const params = {
    AutoScalingGroupName: asg.AutoScalingGroupName,
    MinSize: originalASGSize[0],
    MaxSize: originalASGSize[1],
    DesiredCapacity: originalASGSize[2],
  };

  return retryWhenThrottled(() => autoscaling.send(new UpdateAutoScalingGroupCommand(params)))
    .then(() => asg);
}

function startASGs(asgs) {
  const startedASGs = asgs.map(asg => spinUpASG(asg));
  return Promise.all(startedASGs);
}

module.exports = startASGs;
