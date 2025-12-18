const { AutoScalingClient, CreateOrUpdateTagsCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');
const createTag = require('../utils/createTag');

function tagASG(asg) {
  const autoscaling = new AutoScalingClient({});
  const params = {
    Tags: [
      createTag('stop:hammertime', asg.AutoScalingGroupName, 'auto-scaling-group', new Date().toISOString()),
    ],
  };

  return retryWhenThrottled(() => autoscaling.send(new CreateOrUpdateTagsCommand(params)))
    .then(() => asg);
}

function tagSuspendedASGs(asgs) {
  const taggedASGs = asgs.map(asg => tagASG(asg));
  return Promise.all(taggedASGs);
}

module.exports = tagSuspendedASGs;
