const { RDSClient, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');

function hammertimeStop(data) {
  return (data.TagList.some(tag => tag.Key === 'hammertime:stop'));
}

module.exports = function taggedHammertimeStop(arn) {
  const params = {
    ResourceName: arn
  };
  const rds = new RDSClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return rds.send(new ListTagsForResourceCommand(params))
    .then(data => {
      if (hammertimeStop(data))
        return arn;
      else {
        return null;
      }
    });
};
