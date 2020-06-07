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
import useThrottle from "./useThrottle";
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
import { removeProperty, setProperty, applyEdits } from "./json/edit";
import { toCollection, isCollection } from "./geojsonUtils";
import { FormattingOptions } from "./json/formatter";
import useStringByteLength from "./useStringByteLength";

type JSONLikeObject = { [key: string]: any };

const DEFAULT_CODE = JSON.stringify(featureCollection([]), null, 2);

// Default options for JSON formatter.
const DEFAULT_FORMATTING_OPTIONS: FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
  eol: "\n",
};

const App: React.FC = () => {
  const mapRef = useRef<mapboxgl.Map>();

  const [minimal, setMinimal] = useState(false);
  const [hiddenEditor, setHiddenEditor] = useState(false);

  const [selection, setSelection] = useState<ClickEvent | undefined>();
  const [editing, setEditing] = useState<number | undefined>();

  const [code, setCode] = useState(DEFAULT_CODE);

  const throttledCode = useThrottle(code, 100);
  const { byteLength, isLargeFile } = useStringByteLength(throttledCode);
  const { parsed: parsedGeoJson, codeStatus, idMap } = useParsedGeojson(
    throttledCode
  );

  const parsed = toCollection(parsedGeoJson);

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

  const cloneFeaturesWithOriginalIDs = (
    editing: number = -1,
    editingFeature?: Feature
  ) => {
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

    if (isCollection(parsedGeoJson)) {
      // If already a feature collection, we can just setCode using JSON lib.
      const jsonPath = ["features", editing];
      const formattingOptions = isLargeFile
        ? undefined
        : DEFAULT_FORMATTING_OPTIONS;

      const edits = setProperty(
        throttledCode,
        jsonPath,
        {
          ...editingFeature,
          id: getIDMapping(editingFeature),
        },
        formattingOptions
      );

      setCode(applyEdits(throttledCode, edits, true));
    } else {
      const newCollection = {
        ...parsed,
        features: cloneFeaturesWithOriginalIDs(editing, editingFeature),
      };

      setGeojson(newCollection);
    }

    setEditing(undefined);
  };

  const handleCancel = () => {
    setEditing(undefined);
  };

  const handleDelete = () => {
    if (selection) {
      if (isCollection(parsedGeoJson)) {
        const edits = removeProperty(
          throttledCode,
          ["features", selection.id],
          isLargeFile ? undefined : DEFAULT_FORMATTING_OPTIONS
        );

        setCode(applyEdits(throttledCode, edits));
      } else {
        setCode(DEFAULT_CODE);
      }
    }
  };

  const handleNewFeature = useCallback(
    (f) => {
      if (isCollection(parsedGeoJson)) {
        // If already a feature collection, we can just setCode using JSON lib.
        const edits = setProperty(
          throttledCode,
          ["features", parsed.features.length],
          f,
          isLargeFile ? undefined : DEFAULT_FORMATTING_OPTIONS
        );

        setCode(applyEdits(throttledCode, edits));
      } else {
        // If not, probably faster to use the 'parsed' variable.
        const features = cloneFeaturesWithOriginalIDs();
        features.push(f);

        const newCollection = {
          ...parsed,
          features,
        };

        setGeojson(newCollection);
      }
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
          <JsonEditor
            onChange={setCode}
            value={code}
            codeStatus={codeStatus}
            isLargeFile={isLargeFile}
          />
        )}
      </div>
      <StatusBar codeStatus={codeStatus} byteLength={byteLength} />
    </div>
  );
};

export default App;
