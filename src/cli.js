#!/usr/bin/env node

const COMMANDS = require('./cli-commands.js');

const USAGE = `$ npm run check <command> <parameter>`;

const args = process.argv.slice(2);
const command = args[0];
const parameters = args.slice(1);
const method = COMMANDS[command];

if (typeof method !== "function") {
  console.error(`Usage: ${USAGE}`);
  console.error(`Commands: ${Object.keys(COMMANDS).join(", ")}`);
  process.exit(1);
} else {
  method(...parameters).catch(err => {
    console.error(err);
    process.exit(2);
  });
}
