const { AutoScalingClient, DeleteTagsCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');
const createTag = require('../utils/createTag');

function untagASG(asg) {
  const autoscaling = new AutoScalingClient({});
  const params = {
    Tags: [
      createTag('hammertime:originalASGSize', asg.AutoScalingGroupName, 'auto-scaling-group'),
      createTag('stop:hammertime', asg.AutoScalingGroupName, 'auto-scaling-group'),
    ],
  };

  return retryWhenThrottled(() => autoscaling.send(new DeleteTagsCommand(params)))
    .then(() => asg);
}

function untagASGs(asgs) {
  const untaggedASGs = asgs.map(asg => untagASG(asg));
  return Promise.all(untaggedASGs);
}

module.exports = untagASGs;