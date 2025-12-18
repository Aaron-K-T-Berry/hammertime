const assert = require("assert");
const { mockClient } = require("aws-sdk-client-mock");
const { ECSClient, ListClustersCommand, ListServicesCommand, DescribeClustersCommand, DescribeServicesCommand } = require("@aws-sdk/client-ecs");
const listServicesToStart = require("../../src/ecs/listServicesToStart");
const defaultOperatingTimezone = require("../../src/config").defaultOperatingTimezone;
const data = require("./mockData");

const ecsM = mockClient(ECSClient);

describe("listServicesToStart()", () => {
  beforeEach(() => {
    ecsM.reset();
    ecsM.on(ListClustersCommand).resolves(data.listClusters({}));
    ecsM.on(DescribeClustersCommand).resolves(data.describeClusters({}));
    ecsM.on(ListServicesCommand).callsFake((params) =>
      Promise.resolve(data.listServices(params))
    );
    ecsM.on(DescribeServicesCommand).callsFake((params) =>
      Promise.resolve(data.describeServices(params))
    );
  });

  it("returns list of services spun up by hammertime", () => {
    return listServicesToStart(defaultOperatingTimezone).then(
      hammertimedServices => {
        assert.equal(hammertimedServices.length, 1);
        assert.equal(
          hammertimedServices[0].serviceArn,
          "arn:aws:ecs:service:3-R-hammertimed"
        );
      }
    );
  });

  afterEach(() => {
    ecsM.restore();
  });
});
