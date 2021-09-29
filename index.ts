import axios from "axios";
import isValid from "is-valid-path";
import prompts from "prompts";
import { join, isAbsolute } from "path";
import { program } from "commander";

import { ConfigLoader } from "./src/Config/ConfigLoader";
import { writeFileSync } from "fs";
import { Config } from "./src/Config/Config";

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
  .option("--nodiscovery", "don't discover or test proxies");

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

    writeFileSync(loader.path, JSON.stringify(config, null, 2));
    console.log("✔️ Wrote config");
  } else config = loader.load(); // if the file exists load the config
})();