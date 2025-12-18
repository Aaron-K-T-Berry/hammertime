const assert = require('assert');
const { mockClient } = require('aws-sdk-client-mock');
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const listInstancesToStart = require('../../src/instances/listInstancesToStart');
const defaultOperatingTimezone = require('../../src/config').defaultOperatingTimezone;

const ec2Mock = mockClient(EC2Client);

describe('listInstancesToStart()', () => {
  beforeEach(() => {
    ec2Mock.reset();
  });

  it('returns list of valid instances stopped by hammertime', () => {
    const mockInstances = {
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'i-stoppedbutcanttouchthis',
              Tags: [
                {
                  Key: 'hammertime:canttouchthis',
                  Value: '',
                },
                {
                  Key: 'stop:hammertime',
                  Value: '',
                },
              ],
            },
          ],
        },
        {
          Instances: [
            {
              InstanceId: 'i-validinstance',
              Tags: [
                {
                  Key: 'stop:hammertime',
                  Value: '',
                },
              ],
            },
          ],
        },
      ],
    };
    ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);
    return listInstancesToStart(defaultOperatingTimezone)
      .then((instanceIds) => {
        console.log(instanceIds);
        assert.deepEqual(instanceIds, ['i-validinstance']);
      });
  });

  afterEach(() => {
    ec2Mock.restore();
  });
});
