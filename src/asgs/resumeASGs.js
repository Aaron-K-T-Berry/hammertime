const { AutoScalingClient, ResumeProcessesCommand } = require('@aws-sdk/client-auto-scaling');
const retryWhenThrottled = require('../utils/retryWhenThrottled');

function resumeASGProcesses(asg) {
  const autoscaling = new AutoScalingClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  const params = {
    AutoScalingGroupName: asg.AutoScalingGroupName,
    ScalingProcesses: []
  };

  return retryWhenThrottled(() => autoscaling.send(new ResumeProcessesCommand(params)))
    .then(() => asg);
}

function resumeASGs(asgs) {
  const updatedASGs = asgs.map(asg => resumeASGProcesses(asg));
  return Promise.all(updatedASGs);
}

module.exports = resumeASGs;
