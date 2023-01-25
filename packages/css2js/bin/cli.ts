#! /usr/bin/env node
import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import { css2js } from "..";

const usage = "Usage: css2js [file] [...options]";

const options = yargs(hideBin(process.argv))
  .usage(usage)
  .positional("file", {
    describe: "Path to CSS file", type: "string", demandOption: true
  })
  .option("o", {
    alias: "out", describe: "Destination for css-in-js file", type: "string", demandOption: false
  })
  .option("j", {
    alias: "json", describe: "Generate JSON instead of JS", type: "string", demandOption: false
  })
  .demandOption(["file"])
  .parse();

