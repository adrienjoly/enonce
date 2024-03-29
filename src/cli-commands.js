const fs = require("fs");
const path = require("path");
const surge = require("surge");
const {
  countVariantsFromTemplate,
  fillTemplateForStudent,
  getVariantValuesForStudent,
  getStudentVariant,
  normalizeEmail,
  hashCode,
  getTemplateVariables,
  getTemplateVariablesForStudent,
} = require("./index.js");

const { prependVariables } = require('./cli-helpers.js');

const DEFAULT_TEMPLATE = "data/enonce.md";

const loadTemplate = (filePath = process.env.TEMPLATE || DEFAULT_TEMPLATE) => {
  console.warn(`loading template from ${filePath}...`);
  return fs.promises.readFile(filePath, "utf8");
};

const readStdin = () =>
  new Promise((resolve) => {
    const chunks = [];
    process
      .openStdin()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(chunks.join("")));
  });

module.exports = {
  // Return the number of possible variant combinations from the template
  combinations: async () => {
    const template = await loadTemplate();
    const nbVariants = countVariantsFromTemplate(template);
    console.warn(`=> number of combinations of variants:`);
    console.log(nbVariants);
  },
  // Render the template for a given studentId
  render: async (studentId) => {
    const { LOAD_VARS_FROM_TEMPLATE } = process.env;
    const variables = LOAD_VARS_FROM_TEMPLATE
      ? getTemplateVariablesForStudent(await loadTemplate(LOAD_VARS_FROM_TEMPLATE), studentId)
      : {};
    const template = await loadTemplate();
    const rendered = fillTemplateForStudent.call(variables, template, studentId);
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
    const domain = process.env.SURGE_DOMAIN;
    const localDir = path.normalize(`${__dirname}/../`); // because we deploy from the root dir of this project
    const targetTemplateFile = path.join(localDir, DEFAULT_TEMPLATE);
    const providedTemplateFile = path.join(process.cwd(), process.env.TEMPLATE); // make absolute path from which the CLI was run
    const template = await fs.promises.readFile(providedTemplateFile, "utf8");
    // we can load variables from another template (e.g. to deploy a solution.md file that re-uses the variants from enonce.md)
    const externalVariables = await (async () => {
      const { LOAD_VARS_FROM_TEMPLATE } = process.env;
      return LOAD_VARS_FROM_TEMPLATE
        ? getTemplateVariables(await loadTemplate(path.join(process.cwd(), LOAD_VARS_FROM_TEMPLATE)))
        : null
    })();
    // backup the target file to deploy (data/enonce.md) beforce temporarily replacing it with the final template file
    fs.copyFileSync(targetTemplateFile, `${targetTemplateFile}.bak`); // we backup the sample enonce.md file provided in this project, so it can safely be replaced by the one provided process.env.TEMPLATE
    function exitHandler() {
      try {
        // if running the cli thru npx, the files may have been removed already => restore is unnecessary and will fail
        fs.renameSync(`${targetTemplateFile}.bak`, targetTemplateFile);
      } finally {}
    }
    process.on('exit', exitHandler);              // when app is closing
    process.on('SIGINT', exitHandler);            // ctrl+c event
    process.on('SIGUSR1', exitHandler);           // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR2', exitHandler);           // "
    process.on('uncaughtException', exitHandler); // catches uncaught exceptions
    // copy or generate the template file to be deployed
    const finalTemplate = externalVariables ? prependVariables(template, externalVariables) : template;
    await fs.promises.writeFile(targetTemplateFile, finalTemplate, "utf8"); // we temporally store the resulting file as "enonce.md"
    // deploy
    const deploy = surge({ default: "publish" });
    deploy([ "--project", localDir, ...(domain ? [ "--domain", domain ] : []) ]);
    // Note: when deploy ends, exitHandler() will be called to restore the default enonce.md file
  },
};
