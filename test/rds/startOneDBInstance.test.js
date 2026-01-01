const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const assert = require('assert');
const startOneDBInstance = require('../../src/rds/startOneDBInstance');

describe('startOneDBInstance', () => {
  it('returns an arn of a started RDS DB instance', () => {
    const mockResponse = {
      DBInstance: {
        DBInstanceIdentifier: 'somenstanceid',
        DBInstanceStatus: 'available',
        DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:somenstanceid'
      }
    };
    AWSMock.mock('RDS', 'startDBInstance', (params, callback) => {
      callback(null, mockResponse);
    });
    return startOneDBInstance('arn:aws:rds:aws-region:aws-account:db:somenstanceid')
      .then((arn) => {
        assert.deepEqual(arn, 'arn:aws:rds:aws-region:aws-account:db:somenstanceid');
      });
  });
  afterEach(() => {
    AWSMock.restore('RDS', 'startDBInstance');
  });
});
