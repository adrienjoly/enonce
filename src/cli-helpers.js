const util = require("util");

/**
 * Return a copy of the template (e.g. a solution file), prepended with variant variables. (e.g. extracted by getTemplateVariables() from enonce.md)
 */
 function prependVariables (template, variables) {
  return [
   '<!-- prepended variables: ${ Object.assign(this, {',
      ...Object.entries(variables).map(
        ([variableKey, variableVal]) => `  ${variableKey}: variant(${util.inspect(variableVal)}),` // serialize the javascript object, assuming that variableVal is an array of variant values
      ),
   '}) } -->',
   template,
  ].join('\n');
}

module.exports = {
  prependVariables,
};
