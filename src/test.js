const test = require('ava');

const { fillTemplateForStudent, variantPicker, hashCode, normalizeEmail } = require('./index.js');


test('fillTemplateForStudent', t => {
  t.is(fillTemplateForStudent('abc', 123), 'abc'); // no variant
  t.is(fillTemplateForStudent('abc_${variant(["dummy"])}', 123), 'abc_dummy'); // dummy variant
  t.is(fillTemplateForStudent('abc_${variant(["even", "odd"])}', 123), 'abc_odd');
  t.is(fillTemplateForStudent('abc_${variant(["even", "odd"])}', 124), 'abc_even');
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
