/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  docs: {
    "GeoJSON Format": [
      "intro",
      "position",
      "geometry",
      {
        type: "category",
        label: "Geometries",
        items: [
          "point",
          "multipoint",
          "linestring",
          "multilinestring",
          "polygon",
          "multipolygon",
          "geometrycollection"
        ]
      },
      "feature",
      "feature-collection"
    ],
    Utilities: ["editors", "serialization", "conversion"],
    More: ["antimeridian", "precision"]
  }
};
