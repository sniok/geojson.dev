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
import NewFeatureDrawer from "./NewFeatureDrawer";
import MapPopup from "./MapPopup";
import { featureCollection, Feature, bbox, Id } from "@turf/turf";
import { useParsedGeojson } from "./useParsedGeojson";
import SingleFeautreEditor from "./SingleFeautreEditor";
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
  const [loaded, setLoaded] = useState(false);

  const [selection, setSelection] = useState<ClickEvent | undefined>();
  const [editing, setEditing] = useState<number | undefined>();

  // Geojson in text format
  const [code, setCode] = useState(DEFAULT_CODE);
  const throttledCode = useThrottle(code, 100);

  const { byteLength, isLargeFile } = useStringByteLength(throttledCode);

  // ParsedGeoJson represents what's in editor but in parsed form
  const { parsedGeoJson, codeStatus, idMap } = useParsedGeojson(throttledCode);

  // Collection is slightly modified version of parsedGeoJson to make it easy to work with geojson
  const parsedAsCollection = useMemo(() => toCollection(parsedGeoJson), [
    parsedGeoJson,
  ]);

  const setGeojson = (geojson: JSONLikeObject) => {
    setCode(JSON.stringify(geojson, null, 2));
  };

  // Centering map on content
  const shouldCenterOnNextFrame = useRef(false);
  const centerOnData = () => (shouldCenterOnNextFrame.current = true);
  useEffect(() => {
    const panToData = () => {
      // Already centered. bail
      if (!shouldCenterOnNextFrame.current) {
        return;
      }
      // Map is still loading, spin until loaded
      if (!mapRef.current) {
        setTimeout(panToData, 50);
        return;
      }
      shouldCenterOnNextFrame.current = false;
      mapRef.current.fitBounds(bbox(parsedGeoJson as any) as any, {
        padding: 50,
        animate: false,
      });
    };

    if (shouldCenterOnNextFrame.current) {
      panToData();
    }
  }, [parsedGeoJson]);

  const setFromFileContent = (code: string) => {
    centerOnData();
    setCode(code);
  };

  const formatCode = () => {
    const formatted = JSON.stringify(parsedGeoJson, null, 2);
    setCode(formatted);
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
        centerOnData();
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

    setImmediate(() => setLoaded(true));
  }, []);

  const selectFeature = useCallback(
    (e: ClickEvent) => {
      setSelection(e);
    },
    [setSelection]
  );

  const startEditingFeature = (id: number) => setEditing(id);

  const getIDMapping = (f: Feature): Nullable<Id> => {
    return typeof f.id === "number" && idMap && idMap.has(f.id)
      ? idMap.get(f.id)
      : undefined;
  };

  const cloneFeaturesWithOriginalIDs = (
    editing: number = -1,
    editingFeature?: Feature
  ) => {
    return parsedAsCollection.features.map((parsedFeature, i) => {
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

  const modifyExistingFeature = (editingFeature: Feature) => {
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
      // If it's a feature or geometry save as it is
      setGeojson({ ...editingFeature, id: getIDMapping(editingFeature) });
    }

    setEditing(undefined);
  };

  const cancelEditing = () => setEditing(undefined);

  const deleteExistingFeature = () => {
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

  const saveNewFeature = useCallback(
    (f) => {
      if (isCollection(parsedGeoJson)) {
        // If already a feature collection, we can just setCode using JSON lib.
        const edits = setProperty(
          throttledCode,
          ["features", parsedAsCollection.features.length],
          f,
          isLargeFile ? undefined : DEFAULT_FORMATTING_OPTIONS
        );

        setCode(applyEdits(throttledCode, edits));
      } else {
        // If not, probably faster to use the 'parsed' variable.
        const features = cloneFeaturesWithOriginalIDs();
        features.push(f);

        const newCollection = {
          ...parsedAsCollection,
          features,
        };

        setGeojson(newCollection);
      }
    },
    [parsedAsCollection]
  );

  const featureInfoValue: any = useMemo(() => {
    if (!selection) {
      return null;
    }

    const value = {
      ...parsedAsCollection.features[selection.id],
    };

    // Needed for the JSON editor.
    const idMapping = getIDMapping(parsedAsCollection.features[selection.id]);
    if (idMapping != null) {
      value.id = idMapping;
    } else {
      delete value.id;
    }

    return value;
  }, [selection]);

  return (
    <div className={cx("App", { "App--minimal": minimal })}>
      {!loaded && <div className="App__loading" />}
      <DragAndDrop onFileContent={setFromFileContent} />
      <div className={"workspace"}>
        <Mapbox mapRef={mapRef}>
          {!minimal && editing !== undefined && (
            <SingleFeautreEditor
              feature={parsedAsCollection.features[editing]}
              onCancel={cancelEditing}
              onSave={modifyExistingFeature}
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
                  onClick={() => startEditingFeature(selection.id)}
                >
                  Edit
                </Button>
                <Button
                  icon={<Trash size={15} />}
                  onClick={deleteExistingFeature}
                >
                  Remove
                </Button>
              </div>
            </MapPopup>
          )}
          <Geojson
            data={parsedAsCollection}
            onClick={selectFeature}
            hideIds={editing}
          />
          {!minimal && editing === undefined && (
            <NewFeatureDrawer onNewFeature={saveNewFeature} />
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
        {!minimal && <Actions code={throttledCode} onGeojson={setCode} />}
        {selection && <FeatureInfo feature={featureInfoValue} />}
        {!hiddenEditor && (
          <JsonEditor
            onChange={setCode}
            value={code}
            codeStatus={codeStatus}
            isLargeFile={isLargeFile}
          />
        )}
        {!minimal && (
          <Button
            onClick={formatCode}
            style={{
              position: "absolute",
              zIndex: 1,
              right: 0,
              bottom: 0,
              margin: "15px 20px",
            }}
          >
            prettify
          </Button>
        )}
      </div>
      <StatusBar codeStatus={codeStatus} byteLength={byteLength} />
    </div>
  );
};

export default App;
