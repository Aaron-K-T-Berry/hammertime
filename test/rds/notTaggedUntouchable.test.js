const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const notTaggedUntouchable = require('../../src/rds/notTaggedUntouchable');

const rdsM = mockClient(RDSClient);

describe('notTaggedUntouchable', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns a null if an RDS DB instance is tagged with "hammertime:canttouchthis"', () => {
    const mockTagList = {
      TagList: [{
          Key: 'hammertime:canttouchthis',
          Value: 'homeBoy'
        },
        {
          Key: 'Name',
          Value: 'itsHammer'
        }
      ]
    };
    rdsM.on(ListTagsForResourceCommand).resolves(mockTagList);
    return notTaggedUntouchable('somearn')
      .then((arn) => {
        assert.deepEqual(arn, null);
      });
  });

  it('returns an arn if an RDS DB instance is not tagged with "hammertime:canttouchthis"', () => {
    const mockTagList = {
      TagList: [{
          Key: 'summertime:gershwin',
          Value: 'andTheCottonIsHigh'
        },
        {
          Key: 'Name',
          Value: 'itsGershwin'
        }
      ]
    };
    rdsM.on(ListTagsForResourceCommand).resolves(mockTagList);
    return notTaggedUntouchable('somearn')
      .then((arn) => {
        assert.deepEqual(arn, 'somearn');
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
