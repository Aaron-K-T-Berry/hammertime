const { RDSClient, AddTagsToResourceCommand } = require('@aws-sdk/client-rds');

module.exports = function tagOneDBInstance(arn) {
  const params = {
    ResourceName: arn,
    Tags: [{
      Key: 'hammertime:stop',
      Value: new Date().toISOString()
    }]
  };
  const rds = new RDSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return rds.send(new AddTagsToResourceCommand(params))
    .then(() => arn);
};
