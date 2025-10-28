# Welcome to your CDK TypeScript Construct Library project

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`CdkAwsIpRangesProviderPlugin`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`CdkAwsIpRangesProviderPluginProps`) to configure the visibility timeout of the queue.

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
  }
});

// Retrieve IP ranges for the given service.
const ipRanges = new AwsIpRanges(stack, { service: "AURORA_DSQL" });

// Do something with the ranges.
let vpc = new Vpc(stack, "Vpc", {});
let sg = new SecurityGroup(stack, "SecurityGroup", { vpc, allowAllOutbound: false });
for (const cidr of ipRanges.ipv4Ranges) {
  sg.addEgressRule(Peer.ipv4(cidr), Port.POSTGRES);
}
```

# TODO

[ ] - Add prettier
[ ] - Publish to npm
[ ] - Clean up documentation
[ ] - ???
