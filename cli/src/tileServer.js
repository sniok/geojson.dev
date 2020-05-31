const geojsonvt = require("geojson-vt");
const vtpbf = require("vt-pbf");
const fs = require("fs").promises;

const createIndex = async (file) => {
  let data = await fs.readFile(file, { encoding: "utf-8" });
  const parsed = JSON.parse(data);
  data = undefined;
  const index = geojsonvt(parsed, {
    debug: 1,
    maxZoom: 16,
  });

  return index;
};

const server = async (file) => {
  const index = await createIndex(file);

  return {
    tilePbf: (z, x, y) => {
      const tile = index.getTile(+z, +x, +y);

      if (tile === null) {
        return "";
      }

      const buffer = Buffer.from(vtpbf.fromGeojsonVt({ geojsonLayer: tile }));

      return buffer;
    },
  };
};

module.exports = server;
