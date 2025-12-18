const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const taggedHammertimeStop = require('../../src/rds/taggedHammertimeStop');

const rdsM = mockClient(RDSClient);

describe('taggedHammertimeStop', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns an arn of an RDS DB instance tagged with "hammertime:stop"', () => {
    const mockTagList = {
      TagList: [{
          Key: 'hammertime:stop',
          Value: 'stopHammerTime'
        },
        {
          Key: 'Name',
          Value: 'itsHammer'
        }
      ]
    };
    rdsM.on(ListTagsForResourceCommand).resolves(mockTagList);
    return taggedHammertimeStop('somearn')
      .then((arn) => {
        assert.deepEqual(arn, 'somearn');
      });
  });

  it('returns a null value if RDS DB instance is not tagged with "hammertime:stop"', () => {
    const mockTagList = {
      TagList: [{
          Key: 'summertime:gershwin',
          Value: 'fishAreJumping'
        },
        {
          Key: 'Name',
          Value: 'itsGershwin'
        }
      ]
    };
    rdsM.on(ListTagsForResourceCommand).resolves(mockTagList);
    return taggedHammertimeStop('somearn')
      .then((arn) => {
        console.log("ARN output: " + arn);
        assert.deepEqual(arn, null);
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
