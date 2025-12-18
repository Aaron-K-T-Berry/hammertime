const assert = require('assert');
const { mockClient } = require('aws-sdk-client-mock');
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const listInstancesToStop = require('../../src/instances/listInstancesToStop');
const defaultOperatingTimezone = require('../../src/config').defaultOperatingTimezone;

const ec2Mock = mockClient(EC2Client);

describe('listInstancesToStop()', () => {
  beforeEach(() => {
    ec2Mock.reset();
  });

  it('returns list of valid running instances', () => {
    const mockInstances = {
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'i-instanceinanasg',
              Tags: [
                {
                  Key: 'aws:autoscaling:groupName',
                  Value: 'myapp-ECSAutoScalingGroup-ADSKJFKL2341',
                },
              ],
            },
          ],
        },
        {
          Instances: [
            {
              InstanceId: 'i-validinstance',
              Tags: [],
            },
          ],
        },
        {
          Instances: [
            {
              InstanceId: 'i-canttouchthis',
              Tags: [
                {
                  Key: 'hammertime:canttouchthis',
                  Value: '',
                },
              ],
            },
          ],
        },
      ],
    };
    ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);
    return listInstancesToStop(defaultOperatingTimezone)
      .then((instanceIds) => {
        assert.deepEqual(instanceIds, ['i-validinstance']);
      });
  });

  it('returns an empty list if no running instances found in aws', () => {
    const mockInstances = {
      Reservations: [],
    };
    ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);

    return listInstancesToStop(defaultOperatingTimezone)
      .then((instanceIds) => {
        assert.deepEqual(instanceIds, []);
      });
  });

  afterEach(() => {
    ec2Mock.restore();
  });
});
