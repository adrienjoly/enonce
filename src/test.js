const test = require('ava');

const { modulo, hashCode, normalizeEmail, variantPicker } = require('./index.js');

test('variantPicker returns the right variant based on studentId', t => {
  t.is(variantPicker('1230')(['variant0', 'variant1', 'variant2']), 'variant0');
  t.is(variantPicker('1231')(['variant0', 'variant1', 'variant2']), 'variant1');
  t.is(variantPicker('1232')(['variant0', 'variant1', 'variant2']), 'variant2');
  t.is(variantPicker('1233')(['variant0', 'variant1', 'variant2']), 'variant0');
  t.is(variantPicker('1234')(['even', 'odd']), 'even');
  t.is(variantPicker('1235')(['even', 'odd']), 'odd');
  t.is(variantPicker('1236')(['even', 'odd']), 'even');
});

test('modulo supports short student ids', t => {
  t.is(modulo('0', 2), 0);
  t.is(modulo('1', 2), 1);
  t.is(modulo('2', 2), 0);
});
 
test('modulo supports long student ids', t => {
  t.is(modulo('103769591752335079590', 2), 0);
  t.is(modulo('103769591752335079591', 2), 1);
  t.is(modulo('103769591752335079592', 2), 0);
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
