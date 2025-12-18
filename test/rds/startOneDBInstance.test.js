const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, StartDBInstanceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const startOneDBInstance = require('../../src/rds/startOneDBInstance');

const rdsM = mockClient(RDSClient);

describe('startOneDBInstance', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  it('returns an arn of a started RDS DB instance', () => {
    const mockResponse = {
      DBInstance: {
        DBInstanceIdentifier: 'somenstanceid',
        DBInstanceStatus: 'available',
        DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:somenstanceid',
      }
    };
    rdsM.on(StartDBInstanceCommand).resolves(mockResponse);
    return startOneDBInstance('arn:aws:rds:aws-region:aws-account:db:somenstanceid')
      .then((arn) => {
        assert.deepEqual(arn, 'arn:aws:rds:aws-region:aws-account:db:somenstanceid');
      });
  });

  afterEach(() => {
    rdsM.restore();
  });
});
