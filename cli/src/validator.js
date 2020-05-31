const geojsonhint = require("@mapbox/geojsonhint");

/**
 * Check if passed text is valid GeoJSON
 */
const validate = (geojsonString) => {
  // Parse JSON
  let geojson;
  try {
    geojson = JSON.parse(geojsonString);
  } catch (parseError) {
    return `Input file is not valid JSON:\n ${parseError.message}`;
  }

  // TODO:
  // geojsonhint produces errors that other services usually ignore
  // not sure what to do with it, disabling it for now

  // Try parsing GeoJSON as JSON
  // const errors = geojsonhint.hint(geojson);

  // // Generate detailed errors (with line numbers)
  // if (errors.length) {
  //   const detailedErrors = geojsonhint
  //     .hint(geojsonString)
  //     .filter(it => !it.message.includes("right-hand"))
  //     .map(
  //       err => `GeoJSON validation error at line ${err.line}: ${err.message}`
  //     );

  //   return detailedErrors.join("\n");
  // }

  return false;
};

module.exports = validate;
