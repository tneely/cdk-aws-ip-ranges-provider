import { ContextProviderPlugin } from '@aws-cdk/toolkit-lib';
import * as https from 'https';

const IP_RANGES_URL = 'https://ip-ranges.amazonaws.com/ip-ranges.json';
export const IP_RANGES_PLUGIN = "aws-ip-ranges";

/**
 * Query for looking up AWS service IP ranges
 */
export interface IpRangesContextQuery {
  /**
   * AWS region (e.g., 'us-east-1')
   */
  readonly region: string;
  /**
   * AWS service name (e.g., 'AURORA_DSQL', 'EC2', 'S3')
   */
  readonly service: string;
}

/**
 * Response containing IP ranges for the given region.
 */
export interface IpRangesContextResponse {
  readonly ipv4Ranges: string[];
  readonly ipv6Ranges: string[];
}

/**
 * Raw IP ranges data structure from AWS
 */
interface AwsIpRangesData {
  syncToken: string;
  createDate: string;
  prefixes: Array<{
    ip_prefix: string;
    region: string;
    service: string;
    network_border_group: string;
  }>;
  ipv6_prefixes: Array<{
    ipv6_prefix: string;
    region: string;
    service: string;
    network_border_group: string;
  }>;
}

/**
 * Context provider plugin for AWS IP ranges
 */
export class IpRangesContextProviderPlugin implements ContextProviderPlugin{
  public async getValue(args: IpRangesContextQuery): Promise<IpRangesContextResponse> {
    const data = await this.fetchIpRanges();
    const region = args.region;
    const service = args.service;

    const result: IpRangesContextResponse = { ipv4Ranges: [], ipv6Ranges: [] };

    // Process IPv4 ranges
    for (const prefix of data.prefixes) {
      if (prefix.service === service && prefix.region == region) {
        result.ipv4Ranges.push(prefix.ip_prefix);
      }
    }

    // Process IPv6 ranges
    for (const prefix of data.ipv6_prefixes) {
      if (prefix.service === service && prefix.region == region) {
        result.ipv6Ranges.push(prefix.ipv6_prefix);
      }
    }

    return result;
  }

  private async fetchIpRanges(): Promise<AwsIpRangesData> {
    return new Promise((resolve, reject) => {
      https
        .get(IP_RANGES_URL, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch IP ranges: HTTP ${res.statusCode}`));
            return;
          }

          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as AwsIpRangesData;
              resolve(parsed);
            } catch (err: any) {
              reject(new Error(`Failed to parse IP ranges: ${err.message}`));
            }
          });
        })
        .on('error', (err) => {
          reject(new Error(`Failed to fetch IP ranges: ${err.message}`));
        });
    });
  }
}
