const assert = require("assert");
const { mockClient } = require("aws-sdk-client-mock");
const { ECSClient, ListClustersCommand, ListServicesCommand, DescribeClustersCommand, DescribeServicesCommand } = require("@aws-sdk/client-ecs");
const listServicesToStop = require("../../src/ecs/listServicesToStop.js");
const defaultOperatingTimezone = require("../../src/config.js").defaultOperatingTimezone;
const data = require("./mockData.js");

const ecsM = mockClient(ECSClient);

describe("listServicesToStop()", () => {
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

  it("returns list of services spun down by hammertime", () => {
    return listServicesToStop(defaultOperatingTimezone).then(
      hammertimeableServices => {
        const valid = [
          "arn:aws:ecs:service:1-R-unhammertimed",
          "arn:aws:ecs:service:2-R-unhammertimed"
        ];
        assert.equal(hammertimeableServices.length, 2);
        assert.equal(
          hammertimeableServices.filter(service =>
            valid.some(validService => validService === service.serviceArn)
          ).length,
          2
        );
      }
    );
  });

  afterEach(() => {
    ecsM.restore();
  });
});
