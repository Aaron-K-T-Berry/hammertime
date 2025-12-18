const assert = require("assert");
const { mockClient } = require('aws-sdk-client-mock');
const { AutoScalingClient, DescribeAutoScalingGroupsCommand } = require('@aws-sdk/client-auto-scaling');
const listASGsToResume = require("../../src/asgs/listASGsToResume");
const resumeOnePageResponse = require("./responses/resumeOnePageResponse");
const emptyResponse = require("./responses/emptyResponse");
const paginatedResume = require("./responses/paginatedResume");
const defaultOperatingTimezone =
  require("../../src/config").defaultOperatingTimezone;

const asgMock = mockClient(AutoScalingClient);

describe("listASGsToResume()", () => {
  beforeEach(() => {
    asgMock.reset();
  });

  it("returns list of asgs suspended by hammertime", () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(resumeOnePageResponse);

    return listASGsToResume(defaultOperatingTimezone, "all").then(
      (validAsgs) => {
        assert.equal(validAsgs.length, 1);
        assert.equal(
          validAsgs[0].AutoScalingGroupName,
          "can-touch-this-asg-page-2"
        );
      }
    );
  });

  it("returns an empty list if no asgs found", () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).resolves(emptyResponse);
    return listASGsToResume(defaultOperatingTimezone).then((validAsgs) => {
      assert.deepEqual(validAsgs, []);
    });
  });

  it("handles pagination", () => {
    asgMock.on(DescribeAutoScalingGroupsCommand).callsFake((params) => {
      return Promise.resolve(paginatedResume(params.NextToken));
    });

    return listASGsToResume(defaultOperatingTimezone, "all").then(
      (validAsgs) => {
        assert.equal(validAsgs.length, 2);
        assert.equal(
          validAsgs.some(
            (asg) => asg.AutoScalingGroupName === "can-touch-this-asg-page-1"
          ),
          true
        );
        assert.equal(
          validAsgs.some(
            (asg) => asg.AutoScalingGroupName === "can-touch-this-asg-page-2"
          ),
          true
        );
      }
    );
  });

  afterEach(() => {
    asgMock.restore();
  });
});
