const { RDSClient, RemoveTagsFromResourceCommand } = require('@aws-sdk/client-rds');

module.exports = function untagOneDBInstance(arn) {
  const params = {
    ResourceName: arn,
    TagKeys: ['hammertime:stop']
  };
  const rds = new RDSClient({});
  return rds.send(new RemoveTagsFromResourceCommand(params))
    .then(() => arn);
};
