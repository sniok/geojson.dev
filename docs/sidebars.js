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
