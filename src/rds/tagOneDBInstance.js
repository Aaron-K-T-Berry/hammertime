const { RDSClient, AddTagsToResourceCommand } = require('@aws-sdk/client-rds');

module.exports = function tagOneDBInstance(arn) {
  const params = {
    ResourceName: arn,
    Tags: [{
      Key: 'hammertime:stop',
      Value: new Date().toISOString()
    }]
  };
  const rds = new RDSClient({});
  return rds.send(new AddTagsToResourceCommand(params))
    .then(() => arn);
};
