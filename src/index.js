/**
 * Modulo that also works for big integers stored as string.
 * It only works for positive numbers.
 * cf https://stackoverflow.com/a/16019504/592254
 */
function modulo (divident, divisor) {
  const partLength = 10;
  while (divident.length > partLength) {
      const part = divident.substring(0, partLength);
      divident = (part % divisor) +  divident.substring(partLength);          
  }
  return divident % divisor;
}

/**
 * Hashes a string into a number.
 * cf https://stackoverflow.com/a/7616484/592254
 */
function hashCode (str) {
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Normalizes an email address.
 */
function normalizeEmail (email) {
  return email.toLowerCase().trim();
}

try {
  // make the functions also loadable from Node.js
  module.exports = {
    modulo,
    hashCode,
    normalizeEmail,
  };
} catch (err) {}
