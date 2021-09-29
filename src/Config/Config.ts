import { Proxy } from '../Interfaces/Proxy';

/**
 * Represents a valid configuration.
 */
class Config {
  proxies?: Proxy[];
  usePublicProxiesLists: boolean;
  proxyAPI: boolean;
  blacklistedSources?: string[];
  whitelistedSources?: string[];
  blacklistedProxies?: Proxy[];
  whitelistedProxies?: Proxy[];

  constructor(usePublicProxiesLists?: boolean, proxyAPI?: boolean) {
    this.usePublicProxiesLists = usePublicProxiesLists;
    this.proxyAPI = proxyAPI;
  }
}

export { Config };