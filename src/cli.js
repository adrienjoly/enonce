#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const {
  countVariantsFromTemplate,
  fillTemplateForStudent,
  getStudentVariant,
  normalizeEmail,
  hashCode,
} = require("./index.js");

const USAGE = `$ npm run check <command> <parameter>`;

const readStdin = () =>
  new Promise((resolve) => {
    const chunks = [];
    process
      .openStdin()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(chunks.join("")));
  });

const loadTemplate = (filePath = "data/enonce.md") => {
  console.warn(`loading template from ${filePath}...`);
  return promisify(fs.readFile)(filePath, "utf8");
};

const COMMANDS = {
  combinations: async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    console.warn(`=> number of combinations of variants:`);
    console.log(nbVariants);
  },
  render: async (studentId) => {
    const template = await loadTemplate();
    const rendered = fillTemplateForStudent(template, studentId);
    console.log(rendered);
  },
  "student-variants": async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    const studentsPerVariant = [...Array(nbVariants)].map(() => 0);
    console.warn(`reading students list from stdin...`);
    const lines = (await readStdin()).split(/[\r\n]+/g);
    for (let email of lines) {
      if (!email) continue; // skip empty lines
      const studentId = hashCode(normalizeEmail(email));
      const variant = getStudentVariant(studentId, nbVariants);
      studentsPerVariant[variant]++;
      console.log(`- email: ${email} => variant: ${variant}`);
    }
    console.log('Number of students per variants:', studentsPerVariant);
    const maxStudentsWithCommonVariant = Math.max(...studentsPerVariant);
    console.log(`Highest number of students who share a same variant:`, maxStudentsWithCommonVariant);
    const mostSharedVariants = studentsPerVariant
      .map((count, variant) =>  count === maxStudentsWithCommonVariant ? variant : undefined)
      .filter(Number); // exclude undefined values
    console.log(`Variant(s) most shared by the students:`, mostSharedVariants);
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
