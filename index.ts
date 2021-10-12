import axios from "axios";
import isValid from "is-valid-path";
import prompts from "prompts";
import { join, isAbsolute } from "path";
import { program } from "commander";
import { writeFileSync } from "fs";

import { ConfigLoader } from "./src/Config/ConfigLoader";
import { Config } from "./src/Config/Config";
import { Proxy } from "./src/Interfaces/Proxy";
import { HGWindow } from "./src/HGWindow"

program
  .version("2.0.0")
  .usage("[config]")
  .option("--api", "launch the proxy api")
  .option(
    "-c, --config filename",
    "load a specific config file"
  )
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

if (opts['config']) {
  loader = new ConfigLoader(parsePath(opts['config']));
} else if (program.args) {
  loader = new ConfigLoader(parsePath(program.args[0]));
} else {
  loader = new ConfigLoader(parsePath());
}

(async () => {
  if (!loader.check()) {
    // if the file doesn't exists create one
    console.log(
      "⚠️ Config file doesn't exist or is invalid. Writing new file."
    );

    const usePublicProxiesLists: any = opts['nopublic'] || await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Use public proxy scrape sites?',
      initial: true
    })

    const proxyAPI: any = opts['api'] || await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Start the proxy API with the app?',
      initial: false
    })

    // pass the arguments inside the function
    config = new Config(usePublicProxiesLists, proxyAPI);

    writeFileSync(loader.getPath(), JSON.stringify(config, null, 2));
    console.log("✔️ Wrote config");

    let proxies: Proxy[];
    for (let i = 0; i<50; i++) proxies.push({host: '127.0.0.1'});
    config.proxies = proxies;
    
    const window = new HGWindow(config)
    console.log(window.render(proxies));
  } else config = loader.load(); // if the file exists load the config
})();

while(true) {

}