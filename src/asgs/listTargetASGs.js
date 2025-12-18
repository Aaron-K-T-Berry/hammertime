const { AutoScalingClient, DescribeAutoScalingGroupsCommand } = require('@aws-sdk/client-auto-scaling');
const isInOperatingTimezone = require("../operatingTimezone/isInOperatingTimezone");
const retryWhenThrottled = require('../utils/retryWhenThrottled');

async function getAllASGs() {
  const autoscaling = new AutoScalingClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  const params = {};

  async function followASGPages(allAsgs, token) {
    const requestParams = token ? { ...params, NextToken: token } : params;
    const data = await retryWhenThrottled(() => autoscaling.send(new DescribeAutoScalingGroupsCommand(requestParams)));
    const combinedAsgs = [...allAsgs, ...data.AutoScalingGroups];

    if (data.NextToken) {
      return followASGPages(combinedAsgs, data.NextToken);
    }

    return combinedAsgs;
  }

  return followASGPages([], null);
}

function isASGInCurrentOperatingTimezone(currentOperatingTimezone) {
  const isInCurrentOperatingTimezone = isInOperatingTimezone(
    currentOperatingTimezone
  );
  return (asg) => {
    return isInCurrentOperatingTimezone(asg.Tags);
  };
}

module.exports = async function listTargetASGs({ filter, currentOperatingTimezone }) {
  const allASGs = await getAllASGs();
  return allASGs.filter(filter).filter(isASGInCurrentOperatingTimezone(currentOperatingTimezone));
};

