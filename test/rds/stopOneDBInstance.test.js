const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const assert = require('assert');
const stopOneDBInstance = require('../../src/rds/stopOneDBInstance');

describe('stopOneDBInstance', () => {
  it('returns an arn of a stopped RDS DB instance', () => {
    const mockResponse = {
      DBInstance: {
        DBInstanceIdentifier: 'somenstanceid',
        DBInstanceStatus: 'available',
        DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:somenstanceid'
      }
    };
    AWSMock.mock('RDS', 'stopDBInstance', (params, callback) => {
      callback(null, mockResponse);
    });
    return stopOneDBInstance('arn:aws:rds:aws-region:aws-account:db:somenstanceid')
      .then((arn) => {
        assert.deepEqual(arn, 'arn:aws:rds:aws-region:aws-account:db:somenstanceid');
      });
  });
  afterEach(() => {
    AWSMock.restore('RDS', 'stopDBInstance');
  });
});
