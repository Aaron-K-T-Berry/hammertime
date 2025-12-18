'use strict';

const assert    = require('assert');
const instances = require('../src/instances');
const { mockClient } = require('aws-sdk-client-mock');
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');

const ec2Mock = mockClient(EC2Client);

describe('instances', () => {
  beforeEach(() => {
    ec2Mock.reset();
  });

  describe('listInstancesToStop()', () => {

    it('returns list of valid running instances', () => {
      const mockInstances = {
        "Reservations": [
          {
            "Instances": [
              {
                "InstanceId": "i-instanceinanasg",
                "Tags": [
                  {
                    "Key": "aws:autoscaling:groupName",
                    "Value": "myapp-ECSAutoScalingGroup-ADSKJFKL2341"
                  }
                ]
              }
            ]
          },
          {
            "Instances": [
              {
                "InstanceId": "i-validinstance",
                "Tags": []
              }
            ]
          },
          {
            "Instances": [
              {
                "InstanceId": "i-canttouchthis",
                "Tags": [
                  {
                    "Key": "hammertime:canttouchthis",
                    "Value": ""
                  }
                ]
              }
            ]
          }
        ]
      };
      ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);
      return instances.listInstancesToStop()
        .then(instanceIds => {
          assert.deepEqual(instanceIds, ['i-validinstance']);
        });
    });

    it('returns an empty list if no running instances found in aws', () => {
      const mockInstances = {
          "Reservations": []
        }
      ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);

      return instances.listInstancesToStop()
        .then(instanceIds => {
          assert.deepEqual(instanceIds, []);
        });
    });

    afterEach(() => {
      ec2Mock.restore();
    });

  });

  describe('listInstancesToStart()', () => {

    it('returns list of valid instances stopped by hammertime', () => {
      const mockInstances = {
        "Reservations": [
          {
            "Instances": [
              {
                "InstanceId": "i-stoppedbutcanttouchthis",
                "Tags": [
                  {
                    "Key": "hammertime:canttouchthis",
                    "Value": ""
                  },
                  {
                    "Key": "stop:hammertime",
                    "Value": ""
                  }
                ]
              }
            ]
          },
          {
            "Instances": [
              {
                "InstanceId": "i-validinstance",
                "Tags": [
                  {
                    "Key": "stop:hammertime",
                    "Value": ""
                  }
                ]
              }
            ]
          }
        ]
      };
      ec2Mock.on(DescribeInstancesCommand).resolves(mockInstances);
      return instances.listInstancesToStop()
        .then(instanceIds => {
          assert.deepEqual(instanceIds, ['i-validinstance']);
        });
    });

    afterEach(() => {
      ec2Mock.restore();
    });

  });

});
