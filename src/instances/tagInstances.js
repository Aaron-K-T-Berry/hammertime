const { EC2Client, CreateTagsCommand } = require('@aws-sdk/client-ec2');

function tagInstances(instanceIds) {
  const options = {
    Resources: instanceIds,
    Tags: [
      {
        Key: 'stop:hammertime',
        Value: new Date().toISOString(),
      },
    ],
  };
  const ec2 = new EC2Client({});
  return ec2.send(new CreateTagsCommand(options))
    .then(() => instanceIds);
}

module.exports = tagInstances;
