import asTable from "as-table";
import blessed from "blessed";
import chalk from "chalk";
import { bgGreen, bgYellow, bgRed } from "chalk";

import { Config } from "./Config/Config";
import { Proxy } from "./Interfaces/Proxy";

/**
 * Represents Hell's Gate main window
 */
class HGWindow {
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
        proxies.forEach((proxy) => {
          // get the host and remove the dost in the name
          let hostA: string[] = proxy["host"].split(".");
          let hostT: string;

          hostA.forEach((part: string) => {
            const parsed: number = parseInt(part);
            hostT += parsed.toString(16);
          });

          // getting appropriate color
          let color: Function;
          if ((proxy["privacy"] = "elite")) color = bgGreen;
          else if ((proxy["privacy"] = "anonymous")) color = bgYellow;
          else color = bgRed;

          list += color();
        });
      }
    }

    // proxy list to string
    const table: string = asTable([list]);
  }
}

class Screen {
  private mainBox: blessed.Widgets.BoxElement;
  private prompt: blessed.Widgets.PromptElement;
  private screen: blessed.Widgets.Screen;

  constructor() {
    this.screen = blessed.screen();
    this.screen.title = "Hell's Gate v2";

    // program box
    this.mainBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "100%",
      height: this.screen.height as number,
      border: "line",
      fg: "red",
      value: "",
    });
    this.screen.append(this.mainBox);

    const seps = new Separators(this.mainBox);
    seps.add();
    
    // quit
    this.screen.key(["q", "C-c"], function () {
      process.exit(0);
    });

    /* nothing for now
    screen.screen.key(["enter"], function () {
    });
    */

    this.screen.render();
  }

  // returning a boolean for now, might change if anything else is needed
  public callPrompt(
    config: Config,
    paramName: "proxyAPI" | "usePublicProxiesLists",
    message: string,
    callback?: Function
  ) {
    // Note: any value aside from \"true\" will be inteprated as \"false\".\n Use the proxy API ? (true/False):
    let res: boolean = false;
    if (!this.prompt) this.addPrompt();

    this.prompt.input(message.replace(/\n/g, "\n "), "false", (err, value) => {
      if (err) {
        this.mainBox.setLine((this.mainBox.height as number)-4, err as string);
      } else if (value) {
        res = value === "true";
        config.setValue(paramName, res);
        this.mainBox.setLine((this.mainBox.height as number)-4, chalk.greenBright(`✔️ Edited '${paramName}' `) + chalk.magenta(res));
      }
      this.screen.render();

      if (callback) {
        callback(); // chains prompts if needed
      } else this.removePrompt(); // or removes the overlay
    });
  }

  private addPrompt() {
    this.prompt = blessed.prompt({
      parent: this.screen,
      left: "center",
      top: "center",
      border: "line",
    });
    this.screen.append(this.prompt);
  }

  private removePrompt() {
    this.screen.remove(this.prompt);
    this.prompt = undefined;
  }
}

class Separators {
  private box: blessed.Widgets.BoxElement;
  private separators: number[] = [];

  public constructor(box: any) {
    this.box = box;

    box.on("resize", () => {
      const sep: string = this.sep();

      this.separators.forEach(line => {
        box.deleteLine(line);
        box.insertLine(line, sep);
      });
    });
  }

  public add(): void {
    const { box, separators } = this;

    separators.push((box.height as number)-5);
    box.setLine((box.height as number)-5, this.sep());
  }

  private sep(): string {
    return "_".repeat((this.box.width as number) - 3);
  }
}

export { HGWindow, Screen };