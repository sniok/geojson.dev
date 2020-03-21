import React, { useEffect, useRef, useState } from "react";
import Save from "react-feather/dist/icons/save";
import Cancel from "react-feather/dist/icons/x-circle";
import geojsonhint from "@mapbox/geojsonhint";
import { AllGeoJSON, Feature, featureEach } from "@turf/turf";
import rewind from "@turf/rewind";
import { useMap } from "./Mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Button from "./Button";

function checkWindiwg(geojson: AllGeoJSON) {
  if (geojsonhint.hint(geojson).length) {
    return rewind(geojson);
  }
  return geojson;
}

interface Props {
  feature: Feature;
  onSave: (f: Feature) => void;
  onCancel: () => void;
}
function Editor(props: Props) {
  const [feature, setFeature] = useState(props.feature);
  const map = useMap();

  const save = () => {
    props.onSave({ ...feature, id: props.feature.id });
  };
  const cancel = () => props.onCancel();

  useEffect(() => {
    const Draw = new MapboxDraw({
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false
      }
    });

    map.addControl(Draw, "top-right");

    Draw.add({ ...props.feature, id: 1 });
    Draw.changeMode("simple_select", { featureIds: [1] });

    const updateArea = (e: any) => {
      const [f] = e.features;
      setFeature(f);
    };

    map.on("draw.update", updateArea);

    return () => {
      map.removeControl(Draw);
    };
  }, []);

  return (
    <div className="AppControl">
      <Button icon={<Save size={15} />} onClick={save}>
        Save
      </Button>
      <Button icon={<Cancel size={15} />} onClick={cancel}>
        Cancel
      </Button>
    </div>
  );
}

export default Editor;
