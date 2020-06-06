import { useEffect, useState } from "react";
import geojsonhint from "@mapbox/geojsonhint";
// @ts-ignore
import precision from "geojson-precision";
import { AllGeoJSON } from "@turf/turf";
import rewind from "@turf/rewind";
import { useMap } from "./Mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

function checkWinding(geojson: AllGeoJSON) {
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
      const checked = checkWinding(f);

      // Remove any more than 9 decimal points of precision.
      // GeoJSON recommends no more than 6, however 9 is standard for GPS and professional GIS work.
      props.onNewFeature(precision.parse(checked, 9));
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
