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
  // render() renders the template, given the studentId and variant() function.
  const render = eval(`(variant, studentId) => \`${template.replace(/`/g, "\\`")}\``);
  // variant() returns the value of a variant placeholder, for a particular student
  const variant = (variants) => { 
    if (!Array.isArray(variants)) {
      throw new Error(`parameter of variant() should be an array, got: ${typeof variants}`);
    }
    return variantPicker(studentId)(variants);
  };
  return render(variant, studentId);
}

/**
 * Returns the value for each variant placeholder found in the provided template, for the given studentId.
 */
function getVariantValuesForStudent (template, studentId) {
  // renderTemplate() renders the template by running its `${variant()}` placeholders, given the studentId and variant() function.
  const renderTemplate = eval(`(variant, studentId) => \`${template.replace(/`/g, "\\`")}\``);
  const variantValues = [];
  // variantAccumulator() accumulates values of each variant placeholder
  const variantAccumulator = (variants) => {
    if (!Array.isArray(variants)) {
      throw new Error(`parameter of variant() should be an array, got: ${typeof variants}`);
    }
    variantValues.push(variantPicker(studentId)(variants));
  };
  renderTemplate(variantAccumulator, studentId);
  return variantValues;
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
      .map(variantsStr => {
        try {
          return eval(variantsStr)
        } catch (err) {
          console.error(err)
          console.error("code:", variantsStr);
        }
      })
      .map(variants => variants.length);
  return lcm(variantsPerPlaceholder);
}

/**
 * Redirect to HTTPS if necessary. (required by Google Signin)
 */
function ensureHttps() {
  if (window.location.href.match(/^http\:\/\/(?!localhost|(.*\.ngrok\.io)).*$/)) {
    console.log('Switching to HTTPS...');
    window.location.href = window.location.href.replace('http:', 'https:');
  }
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

/**
 * Load and initialize Google Signin.
 */
function initGoogleAuth(callback) {
  loadResource("data/auth.json?t=" + Date.now(), (request) => {
    const authConfig = JSON.parse(request.response);
    console.log('Loaded auth config:', authConfig);

    if (!authConfig.google_signin_client_id) {
      callback(new Error('No google_signin_client_id found in data/auth.json => skipping Google Auth'));
      return;
    }

    window.onGoogleLoaded = () =>
      gapi.load("auth2", () =>
        gapi.auth2.init({ client_id: authConfig.google_signin_client_id }).then(() => callback())
      );

    // Let's load Google API --> onGoogleLoaded()
    const authScript = document.createElement("script");
    authScript.src = "https://apis.google.com/js/platform.js?onload=onGoogleLoaded";
    authScript.async = true;
    authScript.defer = true;
    document.body.appendChild(authScript);
  });
}

try {
  // make the functions also loadable from Node.js
  module.exports = {
    hashCode,
    normalizeEmail,
    getStudentVariant,
    variantPicker,
    fillTemplateForStudent,
    getVariantValuesForStudent,
    countVariantsFromTemplate,
  };
} catch (err) {}
