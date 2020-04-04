import React, { useState, useEffect, useCallback, useRef } from "react";
import Edit from "react-feather/dist/icons/edit";
import Trash from "react-feather/dist/icons/trash";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import ChevronRight from "react-feather/dist/icons/chevron-right";
import JsonEditor from "./JsonEditor";
import Mapbox from "./Mapbox";
import { Geojson, ClickEvent } from "./Geojson";
import "./App.css";
// @ts-ignore
import cx from "classnames";
import StatusBar from "./StatusBar";
import { useDebounce } from "./useDebounce";
import Drawer from "./Drawer";
import { addFeature, removeFeature } from "./geojsonUtils";
import MapPopup from "./MapPopup";
import { FeatureCollection, Feature, bbox, AllGeoJSON } from "@turf/turf";
import { useParsedGeojson } from "./useParsedGeojson";
import Editor from "./Editor";
import Button from "./Button";
import { FeatureInfo } from "./FeatureInfo";
import { Actions } from "./Actions";
import { DragAndDrop } from "./DragAndDrop";

/*

Todo:

hide code for long files
share?
icons 
zoom if its outside viewport

*/

const example: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

const App: React.FC = () => {
  const mapRef = useRef<mapboxgl.Map>();

  const [minimal, setMinimal] = useState(false);
  const [hiddenEditor, setHiddenEditor] = useState(false);

  const [selection, setSelection] = useState<ClickEvent | undefined>();
  const [editing, setEditing] = useState<number | undefined>();

  const [code, setCode] = useState(JSON.stringify(example, null, 2));

  const debouncedCode = useDebounce(code, 100);
  const { parsed, codeStatus } = useParsedGeojson(debouncedCode);

  const setGeojson = (geojson: any) => {
    setCode(JSON.stringify(geojson, null, 2));
  };

  const fetchGeojson = async (url: string) => {
    const response = await fetch(url).then(x => x.json());
    setGeojson(response);
  };

  const centerOnData = (geojson: AllGeoJSON) => {
    if (!mapRef.current) {
      setTimeout(() => centerOnData(geojson), 50);
      return;
    }
    mapRef.current.fitBounds(bbox(geojson) as any, {
      padding: 50,
      animate: false
    });
  };

  useEffect(() => {
    setSelection(undefined);
  }, [code]);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [hiddenEditor]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const path = urlParams.get("url");
    if (path) {
      fetchGeojson(path);
    }

    const share = urlParams.get("share");
    if (share) {
      fetchGeojson(`https://cdn.dubenko.dev/${share}.json`);
    }

    const json = urlParams.get("json");
    if (json) {
      try {
        const geojson = JSON.parse(decodeURIComponent(json));
        centerOnData(geojson);
        setGeojson(geojson);
      } catch (e) {
        console.error(e);
      }
    }

    const minimal = urlParams.get("minimal");
    if (minimal) {
      setMinimal(true);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
    }

    const hideEditor = urlParams.get("hideEditor");
    if (hideEditor) {
      setHiddenEditor(true);
    }
  }, []);

  const onFeatureClick = (e: ClickEvent) => {
    setSelection(e);
  };

  const handleDelete = () => {
    if (selection) {
      setGeojson(removeFeature(parsed, selection.id));
    }
  };

  const handleEdit = (id: number) => {
    setEditing(id);
  };

  const handleSave = (f: Feature) => {
    if (editing === undefined) {
      return;
    }
    const newFeatures = [...parsed.features];
    newFeatures[editing] = f;
    const newCollection = { ...parsed, features: newFeatures };
    setEditing(undefined);
    setGeojson(newCollection);
  };

  const handleCancel = () => {
    setEditing(undefined);
  };

  const handleNewFeature = useCallback(f => setGeojson(addFeature(parsed, f)), [
    parsed
  ]);

  return (
    <div className={cx("App", { "App--minimal": minimal })}>
      <DragAndDrop onFileContent={setCode} />
      <div className={"workspace"}>
        <Mapbox mapRef={mapRef}>
          {!minimal && editing !== undefined && (
            <Editor
              feature={parsed.features[editing]}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )}
          {editing === undefined && selection && !hiddenEditor && (
            <MapPopup
              onClose={() => setSelection(undefined)}
              lngLat={selection.lngLat}
              key={JSON.stringify(selection.lngLat)}
            >
              <div className="MapPopup__content">
                <Button
                  icon={<Edit size={15} />}
                  onClick={() => handleEdit(selection.id)}
                >
                  Edit
                </Button>
                <Button icon={<Trash size={15} />} onClick={handleDelete}>
                  Remove
                </Button>
              </div>
            </MapPopup>
          )}
          <Geojson data={parsed} onClick={onFeatureClick} hideIds={editing} />
          {!minimal && editing === undefined && (
            <Drawer onNewFeature={handleNewFeature} />
          )}
          <div
            className="EditorToggle"
            onClick={() => {
              setHiddenEditor(x => !x);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
            }}
          >
            {hiddenEditor ? <ChevronLeft /> : <ChevronRight />}
          </div>
        </Mapbox>
        {!minimal && <Actions parsed={parsed} onGeojson={setCode} />}
        {selection && <FeatureInfo feature={parsed.features[selection.id]} />}
        {!hiddenEditor && (
          <JsonEditor onChange={setCode} value={code} codeStatus={codeStatus} />
        )}
      </div>
      <StatusBar codeStatus={codeStatus} />
    </div>
  );
};

export default App;
