const { RDSClient, DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');

module.exports = function listAllDBInstances() {
  const rds = new RDSClient({});
  return rds.send(new DescribeDBInstancesCommand({}));
};
