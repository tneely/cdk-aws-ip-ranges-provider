import { Template } from "aws-cdk-lib/assertions";
import { App, Stack } from "aws-cdk-lib";
import { AwsIpRanges } from "../lib";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

test("can retrieve aws ip ranges", () => {
  const app = new App({
    context: {
      "plugin:account=000111222333:pluginName=aws-ip-ranges:region=us-east-1:service=AURORA_DSQL": {
        ipv4Ranges: ["18.97.33.128/25"],
        ipv6Ranges: ["2600:1f18:692c:300::/56"],
      },
    },
  });
  const stack = new Stack(app, "TestStack", {
    env: {
      account: "000111222333",
      region: "us-east-1",
    },
  });

  // Retrieve IP ranges for the given service.
  const ipRanges = new AwsIpRanges(stack, { service: "AURORA_DSQL" });

  // Do something with the ranges.
  let vpc = new Vpc(stack, "Vpc", {});
  let sg = new SecurityGroup(stack, "SecurityGroup", {
    vpc,
    allowAllOutbound: false,
  });
  for (const cidr of ipRanges.ipv4Ranges) {
    sg.addEgressRule(Peer.ipv4(cidr), Port.POSTGRES);
  }

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::EC2::SecurityGroup", {
    SecurityGroupEgress: [{ CidrIp: "18.97.33.128/25" }],
  });
});
