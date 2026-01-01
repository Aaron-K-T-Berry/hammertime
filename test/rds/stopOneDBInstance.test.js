const AWSMock = require('aws-sdk-mock');
const assert = require('assert');

describe('stopOneDBInstance', () => {
  beforeEach(() => {
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
  });

  it('returns an arn of a stopped RDS DB instance', () => {
    const stopOneDBInstance = require('../../src/rds/stopOneDBInstance');
    return stopOneDBInstance('arn:aws:rds:aws-region:aws-account:db:somenstanceid')
      .then((arn) => {
        assert.deepEqual(arn, 'arn:aws:rds:aws-region:aws-account:db:somenstanceid');
      });
  });
  afterEach(() => {
    AWSMock.restore('RDS', 'stopDBInstance');
  });
});
