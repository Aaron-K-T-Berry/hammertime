const assert = require('assert');
const { mockClient } = require('aws-sdk-client-mock');
const { AutoScalingClient, DescribeAutoScalingGroupsCommand } = require('@aws-sdk/client-auto-scaling');
const listASGsToSuspend = require('../../src/asgs/listASGsToSuspend');
const suspendOnePageResponse = require('./responses/suspendOnePageResponse');
const emptyResponse = require('./responses/emptyResponse');
const suspendAlreadyRunResponse = require('./responses/suspendAlreadyRunResponse');
const paginatedSuspend = require('./responses/paginatedSuspend');
const defaultOperatingTimezone = require('../../src/config').defaultOperatingTimezone;

const asgMock = mockClient(AutoScalingClient);

describe('listASGsToSuspend()', () => {
  beforeEach(() => {
    asgMock.reset();
  });

  it('returns list of valid running asgs', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(suspendOnePageResponse);

    return listASGsToSuspend(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 1);
        assert.equal(validAsgs[0].AutoScalingGroupName, 'can-touch-this-asg-page-2');
      });
  });

  it('returns an empty list if no asgs found', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(emptyResponse);

    return listASGsToSuspend(defaultOperatingTimezone)
      .then((validAsgs) => {
        assert.deepEqual(validAsgs, []);
      });
  });

  it('handles pagination', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).callsFake((params) => {
      return Promise.resolve(paginatedSuspend(params.NextToken));
    });

    return listASGsToSuspend(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 2);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg-page-1'), true);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg-page-2'), true);
      });
  });

  it('ignores asgs that are already suspended by hammertime', () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(suspendAlreadyRunResponse);

    return listASGsToSuspend(defaultOperatingTimezone, 'all')
      .then((validAsgs) => {
        assert.equal(validAsgs.length, 1);
        assert.equal(validAsgs.some(asg => asg.AutoScalingGroupName === 'can-touch-this-asg'), true);
      });
  });

  afterEach(() => {
    asgMock.restore();
  });
});
