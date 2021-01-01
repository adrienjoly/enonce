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

const filePath = process.env.TEMPLATE || "data/enonce.md";

const readStdin = () =>
  new Promise((resolve) => {
    const chunks = [];
    process
      .openStdin()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(chunks.join("")));
  });

const loadTemplate = () => {
  console.warn(`loading template from ${filePath}...`);
  return promisify(fs.readFile)(filePath, "utf8");
};

const COMMANDS = {
  // Return the number of possible variant combinations from the template
  combinations: async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    console.warn(`=> number of combinations of variants:`);
    console.log(nbVariants);
  },
  // Render the template for a given studentId
  render: async (studentId) => {
    const template = await loadTemplate();
    const rendered = fillTemplateForStudent(template, studentId);
    console.log(rendered);
  },
  // Return the studentId generated for each email address passed thru stdin
  "student-ids": async () => {
    console.warn(`reading students list from stdin...`);
    const lines = (await readStdin()).split(/[\r\n]+/g);
    const students = lines.filter(String); // skip empty lines
    console.log(['email', 'studentId'].join('\t'));
    for (let email of students) {
      const studentId = hashCode(normalizeEmail(email));
      console.log([email, studentId].join('\t'));
    }
  },
  // Return the variant for each student email address passed thru stdin
  "student-variants": async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    const studentsPerVariant = [...Array(nbVariants)].map(() => 0);
    console.warn(`reading students list from stdin...`);
    const lines = (await readStdin()).split(/[\r\n]+/g);
    const students = lines.filter(String); // skip empty lines
    for (let email of students) {
      const studentId = hashCode(normalizeEmail(email));
      const variant = getStudentVariant(studentId, nbVariants);
      studentsPerVariant[variant]++;
      console.log(`- email: ${email} => variant: ${variant}`);
    }
    console.log('Number of students:', students.length);
    console.log('Number of students per variants:', studentsPerVariant);
    const unusedVariants = studentsPerVariant
      .map((count, variant) =>  count === 0 ? variant : undefined)
      .filter(Number); // exclude undefined values
    console.log(`Number of variants without students:`, unusedVariants.length, '/', nbVariants, 'combinations');
    const maxStudentsWithCommonVariant = Math.max(...studentsPerVariant);
    console.log(`Highest number of students who share a same variant:`, maxStudentsWithCommonVariant);
    const mostSharedVariants = studentsPerVariant
      .map((count, variant) =>  count === maxStudentsWithCommonVariant ? variant : undefined)
      .filter(Number); // exclude undefined values
    console.log(`Variants most shared by the students:`, mostSharedVariants);
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
  method(...parameters).catch(err => {
    console.error(err);
    process.exit(2);
  });
}
