const { RDSClient, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');

function notUntouchable(data) {
  return !(data.TagList.some(tag => tag.Key === 'hammertime:canttouchthis'));
};

module.exports = function notTaggedUntouchable(arn) {
  const params = {
    ResourceName: arn
  };
  const rds = new RDSClient({});
  return rds.send(new ListTagsForResourceCommand(params))
    .then(data => {
      if (notUntouchable(data))
        return arn;
      else {
        return null;
      }
    });
};
