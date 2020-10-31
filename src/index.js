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
 * Returns the number of the variant to pick for a studentId, given the number of variants.
 */
const getStudentVariant = (studentId, nbVariants) => Math.abs(studentId) % nbVariants;

/**
 * Returns a function that will pick a variant, given a studentId and an array of variants.
 */
const variantPicker = (studentId) => (variants) => variants[getStudentVariant(studentId, variants.length)];

/**
 * Fills the right variant in the provided template, given the studentId, using variantPicker.
 */
function fillTemplateForStudent (template, studentId) {
  const render = eval(`(variant, studentId) => \`${template.replace(/`/g, "\\`")}\``);
  return render(variantPicker(studentId), studentId);
}

/**
 * Count the number of combinations of variants from a template.
 * cf https://stackoverflow.com/a/34955386/592254
 */
function countVariantsFromTemplate (template) {
  // Greatest common divisor of 2 integers
  function gcd2(a, b) {
    if(!b) return b===0 ? a : NaN;
    return gcd2(b, a%b);
  }
  // Greatest common divisor of a list of integers
  function gcd(array) {
    var n = 0;
    for(var i=0; i<array.length; ++i)
      n = gcd2(array[i], n);
    return n;
  }
  // Least common multiple of 2 integers
  function lcm2(a, b) {
    return a*b / gcd2(a, b);
  }
  // Least common multiple of a list of integers
  function lcm(array) {
    var n = 1;
    for(var i=0; i<array.length; ++i)
      n = lcm2(array[i], n);
    return n;
  }
  // now, let's compute
  const variantsPerPlaceholder =
    [...template.matchAll(/\$\{variant\(([^\)]*)\)\}/g)]
      .map(match => match[1])
      .map(variantsStr => JSON.parse(variantsStr))
      .map(variants => variants.length);
  return lcm(variantsPerPlaceholder);
}

/**
 * Load a file from a web page.
 */
function loadResource(url, callback) {
  const request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = () => callback(request);
  request.send();
}

try {
  // make the functions also loadable from Node.js
  module.exports = {
    hashCode,
    normalizeEmail,
    getStudentVariant,
    variantPicker,
    fillTemplateForStudent,
    countVariantsFromTemplate,
  };
} catch (err) {}
