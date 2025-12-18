const { RDSClient, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');

function notUntouchable(data) {
  return !(data.TagList.some(tag => tag.Key === 'hammertime:canttouchthis'));
};

module.exports = function notTaggedUntouchable(arn) {
  const params = {
    ResourceName: arn
  };
  const rds = new RDSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return rds.send(new ListTagsForResourceCommand(params))
    .then(data => {
      if (notUntouchable(data))
        return arn;
      else {
        return null;
      }
    });
};
