const assert = require('assert');
const { mockClient } = require('aws-sdk-client-mock');
const { AutoScalingClient, DescribeAutoScalingGroupsCommand } = require('@aws-sdk/client-auto-scaling');
const listASGsToStop = require('../../src/asgs/listASGsToStop');
const stopOnePageResponse = require('./responses/stopOnePageResponse');
const emptyResponse = require('./responses/emptyResponse');
const stopAlreadyRunResponse = require('./responses/stopAlreadyRunResponse');
const paginatedStop = require('./responses/paginatedStop');
const defaultOperatingTimezone = require('../../src/config').defaultOperatingTimezone;

const asgMock = mockClient(AutoScalingClient);

describe('listASGsToStop()', () => {
  beforeEach(() => {
    asgMock.reset();
  });

  it('returns list of valid running asgs', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(stopOnePageResponse);

    return listASGsToStop(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 1);
        assert.equal(validAsgs[0].AutoScalingGroupName, 'can-touch-this-asg-page-2');
      });
  });

  it('returns an empty list if no asgs found', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(emptyResponse);

    return listASGsToStop(defaultOperatingTimezone)
      .then((validAsgs) => {
        assert.deepEqual(validAsgs, []);
      });
  });

  it('handles pagination', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).callsFake((params) => {
      return Promise.resolve(paginatedStop(params.NextToken));
    });

    return listASGsToStop(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 2);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg-page-1'), true);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg-page-2'), true);
      });
  });

  it('ignores asgs that are already stopped by hammertime', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(stopAlreadyRunResponse);

    return listASGsToStop(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 1);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg'), true);
      });
  });

  afterEach(() => {
    asgMock.restore();
  });
});
