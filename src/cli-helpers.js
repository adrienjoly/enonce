const assert = require("assert");
const util = require("util");

/**
 * Return a copy of the template (e.g. a solution file), prepended with variant variables. (e.g. extracted by getTemplateVariables() from enonce.md)
 */
function prependVariables (template, variables) {
  const renderVariantProp = (propKey, propVal) => {
    assert(Array.isArray(propVal));
    return `    ${propKey}: variant(${util.inspect(propVal)}), `;
  };
  const renderVariantProps = (variantProps) => {
    assert(typeof variantProps === "object" && !Array.isArray(variantProps));
    return Object.entries(variantProps).map(([propKey, propVal]) => renderVariantProp(propKey, propVal)).join('\n')
  };
  const renderVariantVariable = (variableKey, variableVal) => {
    assert(typeof variableVal === "object" && !Array.isArray(variableVal));
    return `  ${variableKey}: {\n${renderVariantProps(variableVal)}\n  },`;
  };
  return [
   '<!-- prepended variables: ${ Object.assign(this, {',
      ...Object.entries(variables).map(
        ([variableKey, variableVal]) => renderVariantVariable(variableKey, variableVal) // serialize the javascript object, assuming that variableVal is an object in which each prop is an array of variant values
      ),
   '}) } -->',
   template,
  ].join('\n');
}

module.exports = {
  prependVariables,
};
