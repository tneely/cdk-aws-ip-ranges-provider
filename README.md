# Welcome to your CDK TypeScript Construct Library project

An AWS IP ranges CDK context provider plugin.

AWS provides a list of service IP ranges in JSON form at https://ip-ranges.amazonaws.com/ip-ranges.json.
The information in this file is generated from AWS's internal system-of-record and is authoritative.
You can expect it to change several times per week and should refresh your `cdk.context.json` file as needed.

## Installation

Add `cdk-aws-ip-ranges-provider` to your project dependencies.

```bash
npm install cdk-aws-ip-ranges-provider
```

Then add `cdk-aws-ip-ranges-provider/plugin` to your cdk.json as a plugin.

```json
{
  "app": "npx ts-node src/app.ts",
  "plugin": ["cdk-aws-ip-ranges-provider/plugin"]
}
```

## Usage

```typescript
import { App, Stack } from "aws-cdk-lib";
import { AwsIpRanges } from "cdk-aws-ip-ranges-provider";
import { Peer, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

const app = new App();
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
```
