---
id: bbox
title: Bounding Box
---

## Bounding Box

A GeoJSON object may have a member named `bbox` to include information on the coordinate range for its Geometries, Features, or FeatureCollections.

The value of the bbox member must be an array of length 2\*n where n is the number of dimensions represented in the contained geometries, with all axes of the most southwesterly point followed by all axes of the more northeasterly point. The axes order of a bbox follows the axes order of geometries.

Example of a 2D bbox member on a Feature:

```json
{
  "type": "Feature",
  "bbox": [-10.0, -10.0, 10.0, 10.0],
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-10.0, -10.0],
        [10.0, -10.0],
        [10.0, 10.0],
        [-10.0, -10.0]
      ]
    ]
  },
  "properties": {}
}
```
