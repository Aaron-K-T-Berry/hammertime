const { EC2Client, DeleteTagsCommand } = require('@aws-sdk/client-ec2');

function untagInstances(instanceIds) {
  const options = {
    Resources: instanceIds,
    Tags: [
      {
        Key: 'stop:hammertime',
      },
    ],
  };
  const ec2 = new EC2Client({ region: process.env.AWS_REGION || 'ap-southeast-2' });
  return ec2.send(new DeleteTagsCommand(options))
    .then(() => instanceIds);
}

module.exports = untagInstances;
