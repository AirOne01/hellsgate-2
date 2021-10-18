import asTable from "as-table";
import blessed from "blessed";
import { bgGreen, bgYellow, bgRed } from 'chalk';

import { Proxy } from "./Interfaces/Proxy";
import { Config } from "./Config/Config";

/**
 * Represents Hell's Gate main window
 */
export class HGWindow {
  config: Config;
  private type: number = 1;

  constructor(config: Config, type?: number) {
    this.config = config;
    this.type = type || this.type;
  }

  /**
   * Render the main window.
   *
   * @param proxies The list of proxies. Must be of type {@link Proxy Proxy[]}
   */
  render(proxies: Proxy[]) {
    let list: string[];

    switch (this.type) {
      case 1: {
        proxies.forEach(proxy => {
          // get the host and remove the dost in the name
          let hostA: string[] = proxy['host'].split('.');
          let hostT: string;

          hostA.forEach((part: string) => {
            const parsed: number = parseInt(part);
            hostT += parsed.toString(16);
          })

          // getting appropriate color
          let color: Function;
          if (proxy['privacy'] = 'elite') color = bgGreen
          else if (proxy['privacy'] = 'anonymous') color = bgYellow
          else color = bgRed;

          list += color();
        })
      }
    }

    // proxy list to string
    const table: string = asTable([list]);
    // new screen object
    const screen: blessed.Widgets.Screen = blessed.screen();
    screen.title = "Hell's Gate v2";

    const box: blessed.Widgets.BoxElement = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      content: table,
      border: {
        type: "line"
      }
    });

    // show result
    screen.append(box);
    box.focus();
    screen.render();
  }
}