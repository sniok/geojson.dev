import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Edit from "react-feather/dist/icons/edit";
import Trash from "react-feather/dist/icons/trash";
import ChevronLeft from "react-feather/dist/icons/chevron-left";
import ChevronRight from "react-feather/dist/icons/chevron-right";
import JsonEditor from "./JsonEditor";
import Mapbox from "./Mapbox";
import { Geojson, ClickEvent } from "./Geojson";
import "./App.css";
import cx from "classnames";
import StatusBar from "./StatusBar";
// @ts-ignore
import { useThrottle } from "use-throttle";
import Drawer from "./Drawer";
import MapPopup from "./MapPopup";
import { featureCollection, Feature, bbox, AllGeoJSON, Id } from "@turf/turf";
import { useParsedGeojson } from "./useParsedGeojson";
import Editor from "./Editor";
import Button from "./Button";
import { FeatureInfo } from "./FeatureInfo";
import { Actions } from "./Actions";
import { DragAndDrop } from "./DragAndDrop";
import { Nullable } from "./types";

type JSONLikeObject = { [key: string]: any };

const DEFAULT_CODE = JSON.stringify(featureCollection([]), null, 2);

const App: React.FC = () => {
  const mapRef = useRef<mapboxgl.Map>();

  const [minimal, setMinimal] = useState(false);
  const [hiddenEditor, setHiddenEditor] = useState(false);

  const [selection, setSelection] = useState<ClickEvent | undefined>();
  const [editing, setEditing] = useState<number | undefined>();

  const [code, setCode] = useState(DEFAULT_CODE);

  const debouncedCode = useThrottle(code, 100);
  const { parsed, codeStatus, idMap } = useParsedGeojson(debouncedCode);

  const setGeojson = (geojson: JSONLikeObject) => {
    setCode(JSON.stringify(geojson, null, 2));
  };

  const fetchGeojson = async (url: string) => {
    const response = await fetch(url).then((x) => x.text());

    try {
      JSON.parse(response);
      setCode(response);
    } catch (e) {
      console.error("Invalid JSON", e);
    }
  };

  const centerOnData = (geojson: AllGeoJSON) => {
    if (!mapRef.current) {
      setTimeout(() => centerOnData(geojson), 50);
      return;
    }
    mapRef.current.fitBounds(bbox(geojson) as any, {
      padding: 50,
      animate: false,
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

  const onFeatureClick = useCallback(
    (e: ClickEvent) => {
      setSelection(e);
    },
    [setSelection]
  );

  const handleEdit = (id: number) => {
    setEditing(id);
  };

  const getIDMapping = (f: Feature): Nullable<Id> => {
    return typeof f.id === "number" && idMap && idMap.has(f.id)
      ? idMap.get(f.id)
      : undefined;
  };

  const cloneFeaturesForText = (
    editing: number = -1,
    editingFeature?: Feature
  ) => {
    // TODO: In the future, could benchmark how much faster it is using string-based JSON APIs
    // from VSCode source (under MIT license).
    return parsed.features.map((parsedFeature, i) => {
      if (i === editing && editingFeature) {
        return {
          ...editingFeature,
          id: getIDMapping(editingFeature),
        };
      }

      return {
        ...parsedFeature,
        id: getIDMapping(parsedFeature),
      };
    });
  };

  const handleSave = (editingFeature: Feature) => {
    if (editing === undefined) {
      return;
    }

    const newCollection = {
      ...parsed,
      features: cloneFeaturesForText(editing, editingFeature),
    };

    setEditing(undefined);
    setGeojson(newCollection);
  };

  const handleCancel = () => {
    setEditing(undefined);
  };

  const handleDelete = () => {
    if (selection) {
      const features = cloneFeaturesForText();
      features.splice(selection.id, 1);

      const newCollection = {
        ...parsed,
        features,
      };

      setGeojson(newCollection);
    }
  };

  const handleNewFeature = useCallback(
    (f) => {
      const features = cloneFeaturesForText();
      features.push(f);

      const newCollection = {
        ...parsed,
        features,
      };

      setGeojson(newCollection);
    },
    [parsed]
  );

  const featureInfoValue: any = useMemo(() => {
    if (!selection) {
      return null;
    }

    const value = {
      ...parsed.features[selection.id],
    };

    // Needed for the JSON editor.
    const idMapping = getIDMapping(parsed.features[selection.id]);
    if (idMapping != null) {
      value.id = idMapping;
    } else {
      delete value.id;
    }

    return value;
  }, [selection]);

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
              setHiddenEditor((x) => !x);
              setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
            }}
          >
            {hiddenEditor ? <ChevronLeft /> : <ChevronRight />}
          </div>
        </Mapbox>
        {!minimal && <Actions parsed={parsed} onGeojson={setCode} />}
        {selection && <FeatureInfo feature={featureInfoValue} />}
        {!hiddenEditor && (
          <JsonEditor onChange={setCode} value={code} codeStatus={codeStatus} />
        )}
      </div>
      <StatusBar codeStatus={codeStatus} />
    </div>
  );
};

export default App;
