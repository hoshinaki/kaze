#! /usr/bin/env node
import yargs from "yargs";

const usage = "Usage: css2js [file] [...options]";

const options = yargs
  .usage(usage)
  .positional("file", {
    describe: "Path to css file", type: "string", demandOption: true
  })
  .option("o", {
    alias: "out", describe: "Destination for css-in-js file", type: "string", demandOption: false
  })
  .option("j", {
    alias: "json", describe: "Generate JSON instead of JS", type: "string", demandOption: false
  })
  .argv;