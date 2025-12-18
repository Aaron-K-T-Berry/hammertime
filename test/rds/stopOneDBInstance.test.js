const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, StopDBInstanceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const stopOneDBInstance = require('../../src/rds/stopOneDBInstance');

const rdsM = mockClient(RDSClient);

describe('stopOneDBInstance', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns an arn of a stopped RDS DB instance', () => {
    const mockResponse = {
      DBInstance: {
        DBInstanceIdentifier: 'somenstanceid',
        DBInstanceStatus: 'available',
        DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:somenstanceid',
      }
    };
    rdsM.on(StopDBInstanceCommand).resolves(mockResponse);
    return stopOneDBInstance('arn:aws:rds:aws-region:aws-account:db:somenstanceid')
      .then((arn) => {
        assert.deepEqual(arn, 'arn:aws:rds:aws-region:aws-account:db:somenstanceid');
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
