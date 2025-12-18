const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, AddTagsToResourceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const tagOneDBInstance = require('../../src/rds/tagOneDBInstance');

const rdsM = mockClient(RDSClient);

describe('tagOneDBInstance', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns an arn of an RDS DB instance if the tag addition is succesfull', () => {
    const mockTagResponse = {};
    rdsM.on(AddTagsToResourceCommand).resolves(mockTagResponse);
    return tagOneDBInstance('somearn')
      .then((arn) => {
        assert.deepEqual(arn, 'somearn');
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
