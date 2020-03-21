---
id: feature
title: Feature
---

A Feature object represents a spatially bounded thing that:

- has a `type` member with the value `Feature`
- has a member `geometry` that is either a [Geometry](geometry) object or `null`
- has a member `properties` that is either a JSON object or `null`
- identifier can be included as an `id` member that is either a string or number

```json
{
  "type": "Feature",
  "id": "thing-1",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0]
      ]
    ]
  },
  "properties": {
    "prop0": "value0",
    "prop1": {
      "this": "that"
    }
  }
}
```
