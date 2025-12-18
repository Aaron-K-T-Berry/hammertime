const { RDSClient, DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');

module.exports = function listAllDBInstances() {
  const rds = new RDSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return rds.send(new DescribeDBInstancesCommand({}));
};
