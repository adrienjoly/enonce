/**
 * Hashes a string into a number. (which can be negative)
 * cf https://stackoverflow.com/a/7616484/592254
 *  & https://stackoverflow.com/a/8076436/592254
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

/**
 * Returns a function that will pick a variant, given a studentId and an array of variants.
 */
const variantPicker = (studentId) => (variants) => variants[Math.abs(studentId) % variants.length];

/**
 * Fills the right variant in the provided template, given the studentId, using variantPicker.
 */
function fillTemplateForStudent (template, studentId) {
  const render = eval(`(variant, studentId) => \`${template.replace(/`/g, "\\`")}\``);
  return render(variantPicker(studentId), studentId);
}


try {
  // make the functions also loadable from Node.js
  module.exports = {
    hashCode,
    normalizeEmail,
    variantPicker,
    fillTemplateForStudent,
  };
} catch (err) {}
