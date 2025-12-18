const { RDSClient, StartDBInstanceCommand } = require('@aws-sdk/client-rds');

module.exports = function startOneDBInstance(arn) {
  const rds = new RDSClient({});

  var instanceId = arn.split(':').pop();
  console.log("Starting " + instanceId + " ...");
  return rds.send(new StartDBInstanceCommand({
      DBInstanceIdentifier: instanceId
    }))
    .then(() => arn);
};
