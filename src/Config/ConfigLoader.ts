import { existsSync } from 'fs';
import { join, isAbsolute } from 'path';
import { Config } from './Config';

/**
 * Reprents the config loader.
 */
class ConfigLoader {
  path: string;

  constructor(path?: string) {
    if (!path) {
      this.path = join(__dirname, './hgconfig.json')
    } else this.path = isAbsolute(path) ? path : join(__dirname, path);
  }

  /**
   * Check whether the config file exists.
   * 
   * @returns {boolean} of whether the config file exists.
   */
  private checkPath(): boolean {
    return existsSync(this.path);
  }

  /**
   * Check whether the config file is parsable and of the {@link Config} type.
   * 
   * @returns {boolean} of whether the config file is valid.
   */
  public check(): boolean {
    if (!this.checkPath()) return false;
    try {
      // may cause errors, so we catch it after
      const config: Config = require(this.path);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load the configuration.
   * 
   * @returns The loaded config
   */
  public load(): Config {
    return require(this.path);
  }
}

export { ConfigLoader }