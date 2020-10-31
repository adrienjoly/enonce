const test = require('ava');

const { modulo, hashCode } = require('./index.js');

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
