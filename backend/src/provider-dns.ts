import { Resolver } from 'node:dns/promises';
import { isIP } from 'node:net';
import { ApiError } from './auth.js';

export type TxtLookup = (name: string) => Promise<string[][]>;
export const createTxtLookup = (servers?: string[]): TxtLookup => async name => {
  const resolver = new Resolver({ timeout: 2000, tries: 2 });
  if (servers) resolver.setServers(servers);
  const timer = setTimeout(() => resolver.cancel(), 5000);
  try { return await resolver.resolveTxt(name); }
  finally { clearTimeout(timer); }
};
export const resolveDomainTxt = createTxtLookup();
export function domainHostname(baseUrl: string) {
  const url = new URL(baseUrl);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || isIP(hostname)
    || hostname.length > 230 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)
    || /\.(localhost|local|internal|test|invalid|example|onion)$/.test(hostname)) {
    throw new ApiError(400, 'DOMAIN_NOT_SUPPORTED', 'Use an HTTP(S) base URL with a publicly delegated DNS hostname and no credentials');
  }
  return hostname;
}
export const domainRecordName = (hostname: string) => `_apihub-verification.${hostname}`;
