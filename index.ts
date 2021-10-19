import blessed from "blessed";
import chalk from "chalk";
import isValid from "is-valid-path";
import { join, isAbsolute } from "path";
import { program } from "commander";
import { writeFileSync } from "fs";

import { Config } from "./src/Config/Config";
import { ConfigLoader } from "./src/Config/ConfigLoader";
import { Proxy } from "./src/Interfaces/Proxy";
import { HGWindow, Screen } from "./src/HGWindow";

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

  const screen: Screen = new Screen();

  if (undefinedUsePublicProxiesLists || undefinedProxyAPI) {
    if (undefinedProxyAPI && undefinedUsePublicProxiesLists) {
      screen.callPrompt(config, "proxyAPI", "Note: any value aside from \"true\" will be inteprated as \"false\".\n Use the proxy API ? (true/False): ", () => {
        screen.callPrompt(config, "proxyAPI", "Note: any value aside from \"true\" will be inteprated as \"false\".\n Fetch public proxies list ? (True/false): ");
      })
    } else if (undefinedProxyAPI) {
      screen.callPrompt(config, "proxyAPI", "Note: any value aside from \"true\" will be inteprated as \"false\".\n Use the proxy API ? (true/False): ");
    } else if (undefinedUsePublicProxiesLists) {
      screen.callPrompt(config, "proxyAPI", "Note: any value aside from \"true\" will be inteprated as \"false\".\n Fetch public proxies list ? (True/false): ");
    }
  }

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
