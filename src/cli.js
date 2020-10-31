#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const { countVariantsFromTemplate } = require("./index.js");

const USAGE = `$ npm run check <command> <parameter>`;

const COMMANDS = {
  combinations: async () => {
    const filePath = "data/enonce.md";
    console.warn(`loading template from ${filePath}...`);
    const template = await promisify(fs.readFile)(filePath, "utf8");
    console.warn(`=> number of combinations of variants:`);
    console.log(countVariantsFromTemplate(template));
  },
};

const args = process.argv.slice(2);
const command = args[0];
const parameters = args.slice(1);
const method = COMMANDS[command];

if (typeof method !== "function") {
  console.error(`Usage: ${USAGE}`);
  console.error(`Commands: ${Object.keys(COMMANDS).join(", ")}`);
  process.exit(1);
} else {
  method(...parameters);
}
