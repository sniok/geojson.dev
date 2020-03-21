---
id: feature-collection
title: FeatureCollection
---

A GeoJSON object with the type `FeatureCollection` is a FeatureCollection object.

A FeatureCollection object has a member with the name `features`. The value of `features` is a JSON array. Each element of the array is a [Feature](feature) object It is possible for this array to be empty.

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-2.46, 45.336],
            [8.085, 42.811],
            [4.218, 49.837],
            [-2.46, 45.336]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [7.393, 48.498],
        "type": "Point"
      }
    }
  ]
}
```
