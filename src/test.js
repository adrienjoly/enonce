const test = require('ava');
const os = require('os');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const {
  getVariantValuesForStudent,
  fillTemplateForStudent,
  variantPicker,
  hashCode,
  normalizeEmail,
  countVariantsFromTemplate,
  getTemplateVariablesForStudent,
  getTemplateVariables,
} = require('./index.js');

const cli = require('./cli-commands.js');

test('getVariantValuesForStudent', t => {
  t.deepEqual(getVariantValuesForStudent('abc', 123), []); // no variant
  t.deepEqual(getVariantValuesForStudent('abc_${variant(["dummy"])}', 123), [ 'dummy' ]); // dummy variant
  t.deepEqual(getVariantValuesForStudent('abc_${variant(["even", "odd"])}', 123), [ 'odd' ]);
  t.deepEqual(getVariantValuesForStudent('abc_${variant(["even", "odd"])}', 124), [ 'even' ]);
  t.deepEqual(getVariantValuesForStudent('abc_${variant(["even", "odd"])}_\n_${variant(["dummy"])}_', 124), [ 'even', 'dummy' ]); // two variant placeholders
});

test('fillTemplateForStudent', t => {
  t.is(fillTemplateForStudent('abc', 123), 'abc'); // no variant
  t.is(fillTemplateForStudent('abc_${variant(["dummy"])}', 123), 'abc_dummy'); // dummy variant
  t.is(fillTemplateForStudent('abc_${variant(["even", "odd"])}', 123), 'abc_odd');
  t.is(fillTemplateForStudent('abc_${variant(["even", "odd"])}', 124), 'abc_even');
  t.throws(() => fillTemplateForStudent('abc_${variant("not", "array")}', 124), { message: 'parameter of variant() should be an array, got: string' });
});

test('fillTemplateForStudent supports variables', t => {
  // variable definition in a HTML comment element
  t.regex(
    fillTemplateForStudent('<!--${ this.myVars = { a: variant(["val"]) } }-->${ this.myVars.a }', 1),
    /val$/
  );
  // variable definition and reference in same placeholder
  t.is(
    fillTemplateForStudent('${ this.myVars = { a: variant(["val"]) }, this.myVars.a }', 1),
    "val"
  );
  // variable definition with Object.assign()
  t.is(
    fillTemplateForStudent('${ Object.assign(this, { myVars: { a: variant(["val"]) } }), this.myVars.a }', 1),
    "val"
  );
});


test('variantPicker returns the right variant based on studentId', t => {
  t.is(variantPicker(1230)(['variant0', 'variant1', 'variant2']), 'variant0');
  t.is(variantPicker(1231)(['variant0', 'variant1', 'variant2']), 'variant1');
  t.is(variantPicker(1232)(['variant0', 'variant1', 'variant2']), 'variant2');
  t.is(variantPicker(1233)(['variant0', 'variant1', 'variant2']), 'variant0');
  t.is(variantPicker(1234)(['even', 'odd']), 'even');
  t.is(variantPicker(1235)(['even', 'odd']), 'odd');
  t.is(variantPicker(1236)(['even', 'odd']), 'even');
  t.is(variantPicker(-1)(['even', 'odd']), 'odd');
});

test('hashCode can turn an email address into a number', t => {
  t.is(hashCode("address@email.com"), 1572473571);
  t.is(hashCode("addres2@email.com"), -1884772382);
  t.is(hashCode("address@email.org"), 1572485190);
});
 
test('normalizeEmail normalizes the email address', t => {
  const normalized = "address@email.com";
  t.is(normalizeEmail("address@email.com"), normalized);
  t.is(normalizeEmail(" address@email.com"), normalized);
  t.is(normalizeEmail("address@email.com "), normalized);
  t.is(normalizeEmail("address@Email.com "), normalized);
});

test('countVariantsFromTemplate computes the number of combinations of variants', t => {
  t.is(countVariantsFromTemplate('- ${variant(["hello","hi","hey"])}'), 3);
  t.is(countVariantsFromTemplate("- ${variant(['hello','hi','hey'])}"), 3); // tolerate single quotes // used to fail with SyntaxError: Unexpected token \' in JSON at position 1
  t.is(countVariantsFromTemplate("- ${variant(['he(ll)o','hi','hey'])}"), 3); // tolerate parenthesis
  t.is(countVariantsFromTemplate('- ${ variant(["hello","hi","hey"]) }'), 3); // tolerate spaces
  t.is(countVariantsFromTemplate('- ${ a = variant(["hello","hi","hey"]) } ${ a }'), 3); // tolerate variables
  t.is(countVariantsFromTemplate('- ${variant(["hello","hi","hey"])}${variant([";",","])} ${variant(["world","all"])} -'), 6);
});

test('getTemplateVariablesForStudent returns variables defined in the template', t => {
  t.deepEqual(
    getTemplateVariablesForStudent('${ this.myVars = { a: variant(["b", "c"]) } }', 0),
    { myVars: { a: "b" } }
  );
  t.deepEqual(
    getTemplateVariablesForStudent('${ this.myVars = { a: variant(["b", "c"]) } }', 1),
    { myVars: { a: "c" } }
  );
  t.deepEqual(
    getTemplateVariablesForStudent('${ Object.assign(this, { myVars: { a: variant(["b", "c"]) } }) }', 1),
    { myVars: { a: "c" } }
  );
});

test('getTemplateVariables returns variables defined in the template', t => {
  t.deepEqual(
    getTemplateVariables('${ this.myVars = { a: variant(["b", "c"]) } }'),
    { myVars: { a: ["b", "c"] } }
  );
  t.deepEqual(
    getTemplateVariables('${ Object.assign(this, { myVars: { a: variant(["b", "c"]) } }) }'),
    { myVars: { a: ["b", "c"] } }
  );
});

async function runCliCommand (args = [], env = {}) {
  let process;
  const stdout = [];
  const stderr = [];
  const exitCode = await new Promise((resolve) => {
    process = childProcess.fork(`${__dirname}/cli.js`, args, {
      env,
      stdio: [0, "pipe", "pipe", "ipc"],
    });
    process.stdout.on("data", (data) => stdout.push(data.toString()));
    process.stderr.on("data", (data) => stderr.push(data.toString()));
    process.on("close", (code) => resolve(code));
  });
  return {
    exitCode,
    stdout: stdout.join(''),
    stderr: stderr.join(''),
  };
}

test('[cli] render', async (t) => {
  const { stdout } = await runCliCommand(["render"], { TEMPLATE: "data/enonce.md" });
  t.snapshot(stdout);
});

test('[cli] render with variables from another template', async (t) => {
  const templateWithVars = path.join(os.tmpdir(), 'template-with-variables.md');
  const templateFromVars = path.join(os.tmpdir(), 'template-from-variables.md');
  await Promise.all([
    fs.promises.writeFile(templateWithVars, "${ this.myVars = { var1: 'hi!' } }"),
    fs.promises.writeFile(templateFromVars, "${ this.myVars.var1 }"),
  ]);
  const { exitCode, stderr, stdout } = await runCliCommand(["render"], {
    TEMPLATE: templateFromVars,
    LOAD_VARS_FROM_TEMPLATE: templateWithVars,
  });
  if (exitCode !== 0 || /error/i.test(stderr)) {
    t.fail(stderr || `exited with code: ${exitCode}`);
  }
  t.regex(stdout, /^hi!/);
});
