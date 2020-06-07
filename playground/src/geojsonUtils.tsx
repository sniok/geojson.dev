import {
  featureCollection,
  GeoJSONObject,
  FeatureCollection,
  Feature,
  Geometry,
  feature,
} from "@turf/turf";

export const isCollection = (geojson: GeoJSONObject): geojson is FeatureCollection =>
  geojson && geojson.type === "FeatureCollection";
export const isFeature = (geojson: GeoJSONObject): geojson is Feature =>
  geojson.type === "Feature";
export const isGeometry = (geojson: GeoJSONObject): geojson is Geometry =>
  [
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
  ].includes(geojson.type);

export const toCollection = (geojson: GeoJSONObject): FeatureCollection => {
  if (isCollection(geojson)) {
    return geojson;
  }
  if (isFeature(geojson)) {
    return featureCollection([geojson]);
  }
  if (isGeometry(geojson)) {
    return featureCollection([feature(geojson)]);
  }
  throw new Error("Unknown type " + geojson.type);
};
