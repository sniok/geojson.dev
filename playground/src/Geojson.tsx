import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { FeatureCollection } from "@turf/helpers";
import { useMap } from "./Mapbox";
import { GeoJSONSource, ExpressionName } from "mapbox-gl";
import usePreferDarkMode from "use-prefer-dark-mode";
import * as layer from "./mapLayers";

type StrictExpression = [
  ExpressionName,
  ...Array<StrictExpression | number | string | boolean>
];

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
    filter,
  }: {
    layer: Omit<mapboxgl.Layer, "source">;
    onClick?: any;
    filter?: StrictExpression;
  }) => {
    const [hasLayer, setHasLayer] = useState(false);
    const sourceId = useContext(SourceContext);
    const map = useMap();

    useEffect(() => {
      map.addLayer({
        ...layer,
        source: sourceId,
      });
      // map.addLayer({
      //   ...layer,
      //   id: layer.id + "-tiles",
      //   source: "tiles",
      //   "source-layer": "geojsonLayer",
      // });

      const hoverOn = () => (map.getCanvas().style.cursor = "pointer");
      const hoverOff = () => (map.getCanvas().style.cursor = "");

      if (onClick) {
        map.on("click", layer.id, onClick);
        // map.on("click", layer.id + "-tiles", onClick);
        map.on("mouseenter", layer.id, hoverOn);
        map.on("mouseleave", layer.id, hoverOff);
      }

      setHasLayer(true);

      return () => {
        map.removeLayer(layer.id);
        if (onClick) {
          map.off("click", layer.id, onClick);
          map.off("mouseenter", layer.id, hoverOn);
          map.off("mouseleave", layer.id, hoverOff);
        }
      };
    }, [layer, onClick]);

    useEffect(() => {
      if (!hasLayer || !layer) {
        return;
      }

      map.setFilter(layer.id, filter);
    }, [hasLayer, layer, filter]);

    return null;
  }
);

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

  const handleClick = useCallback(
    (e: any) => {
      if (onClick) {
        onClick({ lngLat: e.lngLat, id: e.features[0].id });
      }
    },
    [onClick]
  );

  const idFilter: StrictExpression =
    hideIds != null ? ["!=", ["id"], hideIds] : ["to-boolean", "true"];

  // Supports Polygon and MultiPolygon.
  const fillFilter: StrictExpression = [
    "all",
    [
      "any",
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
    ],
    idFilter,
  ];

  // Supports Point and MultiPoint.
  const pointFilter: StrictExpression = [
    "all",
    [
      "any",
      ["==", ["geometry-type"], "Point"],
      ["==", ["geometry-type"], "MultiPoint"],
    ],
    idFilter,
  ];

  // Supports LineString, MultiLineString, Polygon, and MultiPolygon.
  const linesFilter: StrictExpression = [
    "all",
    [
      "any",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["geometry-type"], "MultiLineString"],
      ["==", ["geometry-type"], "Polygon"],
      ["==", ["geometry-type"], "MultiPolygon"],
    ],
    idFilter,
  ];

  return (
    <Source data={data}>
      <MapLayer
        layer={dark ? layer.fillLayer : layer.fillLayerLight}
        onClick={handleClick}
        filter={fillFilter}
      />

      <MapLayer
        layer={dark ? layer.pointLayer : layer.pointLayerLight}
        onClick={handleClick}
        filter={pointFilter}
      />

      <MapLayer
        layer={dark ? layer.linesLayer : layer.linesLayerLight}
        onClick={handleClick}
        filter={linesFilter}
      />
    </Source>
  );
}
