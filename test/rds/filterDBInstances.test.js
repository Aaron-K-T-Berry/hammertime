const { mockClient } = require('aws-sdk-client-mock');
const { RDSClient, DescribeDBInstancesCommand, ListTagsForResourceCommand } = require('@aws-sdk/client-rds');
const assert = require('assert');
const filterDBInstances = require('../../src/rds/filterDBInstances');
const notTaggedUntouchable = require('../../src/rds/notTaggedUntouchable');

const rdsM = mockClient(RDSClient);

describe('instances', () => {
  beforeEach(() => {
    rdsM.reset();
  });

  describe('filterDBInstances()', () => {
    it('returns a list of running RDS DB instances', () => {
      const mockDBInstances = {
        DBInstances: [{
            DBInstanceIdentifier: 'i-availableone',
            DBInstanceStatus: 'available',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-availableone',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],
          },
          {
            DBInstanceIdentifier: 'i-availabletoo',
            DBInstanceStatus: 'available',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-availabletoo',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],
          },
          {
            DBInstanceIdentifier: 'i-stopped',
            DBInstanceStatus: 'stopped',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-stopped',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],
          }
        ]
      };
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('available')
        .then((arns) => {
          assert.deepEqual(arns, ['arn:aws:rds:aws-region:aws-account:db:i-availableone', 'arn:aws:rds:aws-region:aws-account:db:i-availabletoo']);
        });
    });
    it('returns a list of stopped RDS DB instances', () => {
      const mockDBInstances = {
        DBInstances: [{
            DBInstanceIdentifier: 'i-availableone',
            DBInstanceStatus: 'available',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-availableone',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],

          },
          {
            DBInstanceIdentifier: 'i-availabletoo',
            DBInstanceStatus: 'available',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-availabletoo',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],

          },
          {
            DBInstanceIdentifier: 'i-stopped',
            DBInstanceStatus: 'stopped',
            DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-stopped',
            MultiAZ: false,
            ReadReplicaDBInstanceIdentifiers: [],
            ReadReplicaDBClusterIdentifiers: [],
          }
        ]
      }
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('stopped')
        .then((arns) => {
          assert.deepEqual(arns, ['arn:aws:rds:aws-region:aws-account:db:i-stopped']);
        });
    });
    it('returns an empty list if all RDS DB instances are already stopped', () => {
      const mockDBInstances = {
        DBInstances: [{
          DBInstanceIdentifier: 'i-stopped',
          DBInstanceStatus: 'stopped',
          DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-stopped',
          MultiAZ: false,
          ReadReplicaDBInstanceIdentifiers: [],
          ReadReplicaDBClusterIdentifiers: [],
        }]
      };
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('available')
        .then((arns) => {
          assert.deepEqual(arns, []);
        });
    });
    it('returns an empty list if no instances are found in AWS', () => {
      const mockDBInstances = {
        DBInstances: []
      }
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances()
        .then((arns) => {
          assert.deepEqual(arns, []);
        });
    });
    it('filters out multi az db instances', () => {
      const mockDBInstances = {
        DBInstances: [{
          DBInstanceIdentifier: 'i-notstoppable',
          DBInstanceStatus: 'available',
          DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-notstoppable',
          MultiAZ: true,
          ReadReplicaDBInstanceIdentifiers: [],
          ReadReplicaDBClusterIdentifiers: [],
        }]
      };
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('available')
        .then((arns) => {
          assert.deepEqual(arns, []);
        });
    });
    it('filters out db instances with read replica instance identifiers', () => {
      const mockDBInstances = {
        DBInstances: [{
          DBInstanceIdentifier: 'i-notstoppable',
          DBInstanceStatus: 'available',
          DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-notstoppable',
          MultiAZ: false,
          ReadReplicaDBInstanceIdentifiers: ['replica1'],
          ReadReplicaDBClusterIdentifiers: [],
        }]
      };
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('available')
        .then((arns) => {
          assert.deepEqual(arns, []);
        });
    });
    it('filters out db instances with read replica cluster identifiers', () => {
      const mockDBInstances = {
        DBInstances: [{
          DBInstanceIdentifier: 'i-notstoppable',
          DBInstanceStatus: 'available',
          DBInstanceArn: 'arn:aws:rds:aws-region:aws-account:db:i-notstoppable',
          MultiAZ: false,
          ReadReplicaDBInstanceIdentifiers: [],
          ReadReplicaDBClusterIdentifiers: ['replica1'],
        }]
      };
      rdsM.on(DescribeDBInstancesCommand).resolves(mockDBInstances);
      return filterDBInstances('available')
        .then((arns) => {
          assert.deepEqual(arns, []);
        });
    });

    afterEach(() => {
      rdsM.restore();
    });
  });

  describe('notTaggedUntouchable', () => {
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
  });
});
