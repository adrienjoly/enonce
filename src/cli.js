#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const { countVariantsFromTemplate, getStudentVariant, normalizeEmail, hashCode } = require("./index.js");

const USAGE = `$ npm run check <command> <parameter>`;

const readStdin = () => new Promise((resolve) => {
  const chunks = [];
  process
    .openStdin()
    .on("data", (chunk) => chunks.push(chunk))
    .on("end", () => resolve(chunks.join("")));
});

const COMMANDS = {
  combinations: async () => {
    const filePath = "data/enonce.md";
    console.warn(`loading template from ${filePath}...`);
    const template = await promisify(fs.readFile)(filePath, "utf8");
    console.warn(`=> number of combinations of variants:`);
    console.log(countVariantsFromTemplate(template));
  },
  "student-variants": async () => {
    const filePath = "data/enonce.md";
    console.warn(`loading template from ${filePath}...`);
    const template = await promisify(fs.readFile)(filePath, "utf8");
    const nbVariants = countVariantsFromTemplate(template);
    const studentsPerVariant = [...Array(nbVariants)].map(() => 0);

    console.warn(`reading students list from stdin...`);
    const lines = (await readStdin()).split(/[\r\n]+/g);
    for (let email of lines) {
      if (!email) continue;
      const studentId = hashCode(normalizeEmail(email));
      const variant = getStudentVariant(studentId, nbVariants);
      studentsPerVariant[variant]++;
      console.log(`- email: ${email} => variant: ${variant}`);
    }
    console.log({studentsPerVariant});
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
