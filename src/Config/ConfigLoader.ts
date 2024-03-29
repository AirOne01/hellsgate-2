import { existsSync } from 'fs';
import { join, isAbsolute } from 'path';
import { Config } from './Config';

/**
 * Reprents the config loader.
 */
class ConfigLoader {
  private path: string;
  private noCheck: boolean = false;

  constructor(path?: string) {
    if (!path) {
      this.path = join(__dirname, './hgconfig.json')
    } else this.path = isAbsolute(path) ? path : join(__dirname, path);
  }

  /**
   * Abort checking for local file, if not needed.
   */
  public cancelCheck(): void {
    this.noCheck = true;
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
    if (this.noCheck) return true;
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

  /**
   * Gets the path to the config file
   * 
   * @returns {string} the path to the config file
   */
  public getPath(): string {
    return this.path;
  }
}

export { ConfigLoader }