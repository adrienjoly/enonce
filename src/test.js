const test = require('ava');

const {
  getVariantValuesForStudent,
  fillTemplateForStudent,
  variantPicker,
  hashCode,
  normalizeEmail,
  countVariantsFromTemplate
} = require('./index.js');

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
  t.is(countVariantsFromTemplate('- ${ variant(["hello","hi","hey"]) }'), 3); // tolerate spaces
  t.is(countVariantsFromTemplate('- ${ a = variant(["hello","hi","hey"]) } ${ a }'), 3); // tolerate variables
  t.is(countVariantsFromTemplate('- ${variant(["hello","hi","hey"])}${variant([";",","])} ${variant(["world","all"])} -'), 6);
});
