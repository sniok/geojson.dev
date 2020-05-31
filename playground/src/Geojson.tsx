import React, { useEffect, useState, useContext, useMemo } from "react";
import { featureEach } from "@turf/meta";
import { featureCollection, FeatureCollection } from "@turf/helpers";
import { useMap } from "./Mapbox";
import { GeoJSONSource, Layer } from "mapbox-gl";
import { addIds, removeFeature } from "./geojsonUtils";
import usePreferDarkMode from "use-prefer-dark-mode";
import * as layer from "./mapLayers";

export interface ClickEvent {
  id: number;
  lngLat: { lat: number; lng: number };
}

const SourceContext = React.createContext<string>(undefined as any);
function Source({ data, children }: { data: any; children: any }) {
  const [ready, setReady] = useState(false);
  const map = useMap();
  const [id] = useState(() => String((Math.random() * 1000) | 0));

  useEffect(() => {
    let source = map.getSource(id) as GeoJSONSource;
    if (!source) {
      map.addSource(id, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      source = map.getSource(id) as GeoJSONSource;
    }
    source.setData(data);
    if (!ready) {
      setReady(true);
    }
  }, [id, data]);

  return ready ? (
    <SourceContext.Provider value={id}>{children}</SourceContext.Provider>
  ) : null;
}

const MapLayer = React.memo(
  ({
    layer,
    onClick,
  }: {
    layer: Omit<mapboxgl.Layer, "source">;
    onClick?: any;
  }) => {
    const sourceId = useContext(SourceContext);
    const map = useMap();
    useEffect(() => {
      map.addLayer({
        ...layer,
        source: sourceId,
      });
      map.addLayer({
        ...layer,
        id: layer.id + "-tiles",
        source: "tiles",
        "source-layer": "geojsonLayer",
      });

      const hoverOn = () => (map.getCanvas().style.cursor = "pointer");
      const hoverOff = () => (map.getCanvas().style.cursor = "");

      if (onClick) {
        map.on("click", layer.id, onClick);
        map.on("click", layer.id + "-tiles", onClick);
        map.on("mouseenter", layer.id, hoverOn);
        map.on("mouseleave", layer.id, hoverOff);
      }

      return () => {
        map.removeLayer(layer.id);
        if (onClick) {
          map.off("click", layer.id, onClick);
          map.off("mouseenter", layer.id, hoverOn);
          map.off("mouseleave", layer.id, hoverOff);
        }
      };
    }, [layer]);
    return null;
  }
);

const bucketFeatures = (geojson: any): any => {
  const lines: any = [];
  const fill: any = [];
  const points: any = [];
  featureEach(geojson, (f) => {
    switch ((f.geometry as any).type) {
      case "Point":
      case "MultiPoint":
        points.push(f);
        return;
      case "LineString":
      case "MultiLineString":
        lines.push(f);
        return;
      case "Polygon":
      case "MultiPolygon":
        fill.push(f);
        lines.push(f);
        return;
    }
  });
  return {
    lines: featureCollection(lines),
    fill: featureCollection(fill),
    points: featureCollection(points),
  };
};

export function Geojson({
  data,
  onClick,
  hideIds,
}: {
  data: FeatureCollection;
  onClick?: (e: ClickEvent) => void;
  hideIds?: number;
}) {
  const dark = usePreferDarkMode();
  const { lines, fill, points } = useMemo(() => {
    let withIds = addIds(data);
    if (hideIds !== undefined) {
      withIds = removeFeature(withIds, hideIds);
    }
    return bucketFeatures(withIds);
  }, [data, hideIds]);

  const handleClick = (e: any) => {
    if (onClick) {
      onClick({ lngLat: e.lngLat, id: e.features[0].id });
    }
  };

  return (
    <>
      <Source data={fill}>
        <MapLayer
          layer={dark ? layer.fillLayer : layer.fillLayerLight}
          onClick={handleClick}
        />
        <MapLayer layer={dark ? layer.lineLayer : layer.lineLayerLight} />
      </Source>
      <Source data={points}>
        <MapLayer
          layer={dark ? layer.pointLayer : layer.pointLayerLight}
          onClick={handleClick}
        />
      </Source>
      <Source data={lines}>
        <MapLayer
          layer={dark ? layer.linesLayer : layer.linesLayerLight}
          onClick={handleClick}
        />
      </Source>
    </>
  );
}
