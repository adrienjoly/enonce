#!/usr/bin/env node

const fs = require("fs");
const { promisify } = require("util");
const {
  countVariantsFromTemplate,
  fillTemplateForStudent,
  getVariantValuesForStudent,
  getStudentVariant,
  normalizeEmail,
  hashCode,
} = require("./index.js");
const surge = require("surge");

const USAGE = `$ npm run check <command> <parameter>`;

const DEFAULT_TEMPLATE = "data/enonce.md";
const filePath = process.env.TEMPLATE || DEFAULT_TEMPLATE;

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
  // Return the value of each variant placeholder, for a given studentId. (one line per value)
  "variant-data": async (studentId) => {
    if (isNaN(studentId)) {
      throw new Error(`please provide a valid studentId`);
    }
    const template = await loadTemplate();
    const variantValues = getVariantValuesForStudent(template, studentId);
    console.log(variantValues.join('\n'));
  },
  // Return the studentId generated for each email address passed thru stdin, in TSV format
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
  // Return the variant number for each student email address passed thru stdin, in csv format
  "get-student-variants": async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    console.warn(`reading students list from stdin...`);
    const lines = (await readStdin()).split(/[\r\n]+/g);
    const students = lines.filter(String); // skip empty lines
    console.log(`"email","variant"`);
    for (let email of students) {
      const studentId = hashCode(normalizeEmail(email));
      const variant = getStudentVariant(studentId, nbVariants);
      console.log(`"${email}",${variant}`);
    }
  },
  // Return various statistics to measure the distribution of variants for each student email address passed thru stdin
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
  "deploy": async() => {
    if (!process.env.TEMPLATE) {
      throw new Error("Missing environment variable: TEMPLATE");
    }
    fs.renameSync(`${__dirname}/${DEFAULT_TEMPLATE}`, `${__dirname}/${DEFAULT_TEMPLATE}.bak`);
    try {
      fs.copyFileSync(process.cwd() + "/" + process.env.TEMPLATE, `${__dirname}/${DEFAULT_TEMPLATE}`);
      const deploy = surge({ default: "publish" });
      const domain = process.env.SURGE_DOMAIN;
      deploy([ "--project", __dirname, ...(domain ? [ "--domain", domain ] : []) ]);
    } finally {
      fs.renameSync(`${__dirname}/${DEFAULT_TEMPLATE}.bak`, `${__dirname}/${DEFAULT_TEMPLATE}`);
    }
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
