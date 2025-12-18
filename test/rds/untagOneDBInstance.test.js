const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, RemoveTagsFromResourceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const untagOneDBInstance = require('../../src/rds/untagOneDBInstance');

const rdsM = mockClient(RDSClient);

describe('untagOneDBInstance', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns an arn of an RDS DB instance if the tag removal is succesful', () => {
    const mockTagResponse = {};
    rdsM.on(RemoveTagsFromResourceCommand).resolves(mockTagResponse);
    return untagOneDBInstance('somearn')
      .then((arn) => {
        assert.deepEqual(arn, 'somearn');
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
