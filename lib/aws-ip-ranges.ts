import { ContextProvider, Stack } from "aws-cdk-lib";
import { IP_RANGES_PLUGIN, IpRangesContextQuery, IpRangesContextResponse } from "./aws-ip-ranges-context-provider";
import { Construct } from "constructs";

export interface AwsIpRangesProps {
  /**
   * AWS service name (e.g., 'AURORA_DSQL', 'EC2', 'S3')
   */
  service: string,
  /**
   * AWS region (e.g., 'us-east-1')
   * 
   * @default `Stack.of(scope).region`
   */
  region?: string,
}

/**
 * Provides a list of IP ranges for the given AWS service.
 */
export class AwsIpRanges {
  /**
   * IPv4 CIDR blocks
   */
  public readonly ipv4Ranges: string[];
  /**
   * IPv6 CIDR blocks
   */
  public readonly ipv6Ranges: string[];
  
  constructor(scope: Construct, props: AwsIpRangesProps) {
    const region = props.region ?? Stack.of(scope).region;
    const response: IpRangesContextResponse = ContextProvider.getValue(scope, {
          provider: 'plugin',
          props: {
            pluginName: IP_RANGES_PLUGIN,
            service: props.service,
            region,
          } satisfies IpRangesContextQuery & { pluginName: string },
      dummyValue: { ipv4Ranges: [], ipv6Ranges: [] } satisfies IpRangesContextResponse,
    }).value;
    
    
    this.ipv4Ranges = response.ipv4Ranges ?? [];
    this.ipv6Ranges = response.ipv6Ranges ?? [];
  }
}
