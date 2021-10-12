import { Proxy } from '../Interfaces/Proxy';

/**
 * Represents a valid configuration.
 */
class Config {
  proxies?: Proxy[];
  private usePublicProxiesLists: boolean;
  private proxyAPI: boolean;
  private blacklistedSources?: string[];
  private whitelistedSources?: string[];
  private blacklistedProxies?: Proxy[];
  private whitelistedProxies?: Proxy[];

  constructor(usePublicProxiesLists?: boolean, proxyAPI?: boolean) {
    this.usePublicProxiesLists = usePublicProxiesLists;
    this.proxyAPI = proxyAPI;
  }
}

export { Config };