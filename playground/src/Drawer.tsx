import { useEffect, useRef, useState } from "react";
import geojsonhint from "@mapbox/geojsonhint";
import { AllGeoJSON } from "@turf/turf";
import rewind from "@turf/rewind";
import { useMap } from "./Mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

function checkWindiwg(geojson: AllGeoJSON) {
  if (geojsonhint.hint(geojson).length) {
    return rewind(geojson);
  }
  return geojson;
}

interface Props {
  onNewFeature: (f: any) => void;
}
function Drawer(props: Props) {
  const map = useMap();

  const testRef = useRef<any>();
  testRef.current = props.onNewFeature;

  const [draw, setDraw] = useState<any>(undefined);

  useEffect(() => {
    const Draw = new MapboxDraw({
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: false,
        combine_features: false,
        uncombine_features: false,
      },
    });

    map.addControl(Draw, "top-right");

    setDraw(Draw);

    return () => {
      map.removeControl(Draw);
    };
  }, []);

  useEffect(() => {
    if (!draw) {
      return;
    }
    const updateArea = (e: any) => {
      const [f] = e.features;
      delete f.id;
      const checked = checkWindiwg(f);
      testRef.current(checked);
      draw.deleteAll();
    };

    map.on("draw.create", updateArea);
    return () => {
      map.off("draw.create", updateArea);
    };
  }, [draw, props.onNewFeature]);

  return null;
}

export default Drawer;
