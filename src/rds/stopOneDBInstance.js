const { RDSClient, StopDBInstanceCommand } = require('@aws-sdk/client-rds');

module.exports = function stopOneDBInstance(arn) {
  const rds = new RDSClient({});

  var instanceId = arn.split(':').pop();
  console.log("Stopping " + instanceId + "...");
  return rds.send(new StopDBInstanceCommand({
      DBInstanceIdentifier: instanceId
    }))
    .then(() => arn);
};
