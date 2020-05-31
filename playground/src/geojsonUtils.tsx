import turf, {
  featureCollection,
  GeoJSONObject,
  FeatureCollection,
  Feature,
  Geometry,
  feature,
  featureEach,
} from "@turf/turf";

const isCollection = (geojson: GeoJSONObject): geojson is FeatureCollection =>
  geojson.type === "FeatureCollection";
const isFeature = (geojson: GeoJSONObject): geojson is Feature =>
  geojson.type === "Feature";
const isGeometry = (geojson: GeoJSONObject): geojson is Geometry =>
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

export const addIds = (collection: FeatureCollection): FeatureCollection => {
  return {
    ...collection,
    features: collection.features.map((x, i) => ({ ...x, id: i })),
  };
};

export const removeFeature = (
  geojson: FeatureCollection,
  id: number
): FeatureCollection => {
  const newFeatures = geojson.features.filter((_, i) => i !== id);

  return { ...geojson, features: newFeatures };
};

export const addFeature = (geojson: GeoJSONObject, feature: Feature) => {
  const merged = featureCollection([
    ...toCollection(geojson).features,
    feature,
  ]);
  return merged;
};
