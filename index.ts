import blessed from "blessed";
import chalk from "chalk";
import isValid from "is-valid-path";
import { join, isAbsolute } from "path";
import { program } from "commander";
import { writeFileSync } from "fs";

import { ConfigLoader } from "./src/Config/ConfigLoader";
import { Config } from "./src/Config/Config";
import { Proxy } from "./src/Interfaces/Proxy";
import { HGWindow } from "./src/HGWindow";

program
  .version("2.0.0")
  .usage("[config]")
  .option("--api", "launch the proxy api")
  .option("-c, --config filename", "load a specific config file")
  .option("-h, --headless", "run headless")
  .option("--nopublic", "don't use public proxy lists")
  .option("--nodiscovery", "don't test proxies speeed and reaction");

program.parse(process.argv);
const opts: any = program.opts();

function parsePath(path?: string): string {
  if (!path) {
    console.log("⚠️ No config path provided. Using default at ./hgconfig.json");
    return join(__dirname, "./hgconfig.json");
  }
  if (isValid(path)) {
    if (isAbsolute(path)) return path;
    else return join(__dirname, path);
  } else {
    console.log(
      "⚠️ Invalid config path provided. Using default at ./hgconfig.json"
    );
    return join(__dirname, "./hgconfig.json");
  }
}

let config: Config = new Config(true, false);
let loader: ConfigLoader;
let path: string;

if (opts["config"]) {
  loader = new ConfigLoader(parsePath(opts["config"]));
} else if (program.args) {
  loader = new ConfigLoader(parsePath(program.args[0]));
} else {
  loader = new ConfigLoader(parsePath());
  loader.cancelCheck();
}

if (loader.check()) {
  // if the file doesn't exists create one
  console.log("⚠️ Config file doesn't exist or is invalid. Writing new file.");

  // new screen object
  const screen: blessed.Widgets.Screen = blessed.screen();
  screen.title = "Hell's Gate v2";

  // box containing the proxy list
  // TODO: make this responsive
  // https://stackoverflow.com/questions/63249530
  let proxyBox: blessed.Widgets.BoxElement = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: (screen.height as number) - 5,
    border: "line",
    fg: "red",
    value: ""
  })
  screen.append(proxyBox);

  // infobox at the bottom
  let infoBox: blessed.Widgets.BoxElement = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 5,
    border: "line",
    fg: "red",
    value: ""
  })
  screen.append(infoBox);

  let usePublicProxiesLists: boolean;
  let undefinedUsePublicProxiesLists: boolean = false;
  let proxyAPI: boolean;
  let undefinedProxyAPI: boolean = false;

  if (opts.hasOwnProperty("api")) {
    proxyAPI = opts["api"];
  } else {
    proxyAPI = false;
    undefinedProxyAPI = true;
  }
  if (opts.hasOwnProperty("nopublic")) {
    usePublicProxiesLists = opts["nopublic"];
  } else {
    usePublicProxiesLists = false;
    undefinedUsePublicProxiesLists = true;
  }

  // this whole part is for replacing prompts.js with native prompts
  if (undefinedUsePublicProxiesLists || undefinedProxyAPI) {
    const prompt: blessed.Widgets.PromptElement = blessed.prompt({
      parent: screen,
      left: "center",
      top: "center",
      border: "line"
    })
    screen.append(prompt);

    if (undefinedProxyAPI && undefinedUsePublicProxiesLists) {
      prompt.input("Note: any value aside from \"true\" will be inteprated as \"false\".\n Use the proxy API ? (true/False): ", "false", (err, value) => {
        if (err) {
          infoBox.content = err;
        } else if (value) {
          proxyAPI = (value === "true");
          infoBox.content = chalk.greenBright("✔️ Edited 'proxyAPI' ") + chalk.magenta(proxyAPI);
        }
        screen.render();
        prompt.input("Note: any value aside from \"true\" will be inteprated as \"false\".\n Fetch public proxies list ? (True/false): ", "true", (err, value) => {
          if (err) {
            infoBox.content = err;
          } else if (value) {
            usePublicProxiesLists = (value === "true");
            infoBox.content = chalk.greenBright("✔️ Edited 'usePublicProxiesLists' ") + chalk.magenta(usePublicProxiesLists);
          }
          screen.render();
        });
      })
    } else if (undefinedProxyAPI) {
      prompt.input("Note: any value aside from \"true\" will be inteprated as \"false\".\n Use the proxy API ? (true/False): ", "false", (err, value) => {
        if (err) {
          infoBox.content = err;
        } else if (value) {
          proxyAPI = (value === "true");
          infoBox.content = chalk.greenBright("✔️ Edited 'proxyAPI' ") + chalk.magenta(proxyAPI);
        }
        screen.render();
      })
    } else if (undefinedUsePublicProxiesLists) prompt.input("Note: any value aside from \"true\" will be inteprated as \"false\".\n Fetch public proxies list ? (True/false): ", "true", (err, value) => {
      if (err) {
        infoBox.content = err;
      } else if (value) {
        usePublicProxiesLists = (value === "true");
        infoBox.content = chalk.greenBright("✔️ Edited 'usePublicProxiesLists' ") + chalk.magenta(usePublicProxiesLists);
      }
      screen.render();
    });

    // nothing for now
    screen.key(["enter"], function () {
    });

    // quit
    screen.key(["q", "C-c"], function () {
      process.exit(0);
    });
  }

  screen.render();

  // pass config
  config = new Config(usePublicProxiesLists, proxyAPI);

  writeFileSync(loader.getPath(), JSON.stringify(config, null, 2));
  console.log("✔️ Wrote config");

  // debug thing
  let proxies: Proxy[] = [];
  for (let i = 0; i < 50; i++) proxies.push({ host: "127.0.0.1" });
  config.proxies = proxies;

  // renders the window
  const window = new HGWindow(config);
  window.render(proxies);
} else config = loader.load(); // if the file exists load the config
