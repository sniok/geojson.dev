import React, { useRef, useEffect, useState } from "react";

import { monaco as MonacoLoader, ControlledEditor } from "@monaco-editor/react";
import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

import usePreferDarkMode from "use-prefer-dark-mode";
import { CodeStatus } from "./useParsedGeojson";
import "./JsonEditor.css";
import { rafThrottle } from "./rafThrottle";

type Diagnostic = Monaco.editor.IMarkerData;

// Force Monaco Editor to use our local version.
function configureMonaco(loader: any, vs: string): typeof MonacoLoader {
  loader.config({ paths: { vs } });
  loader.__config.urls.monacoBase = vs;
  loader.__config.urls.monacoLoader = `${vs}/loader.js`;

  return loader;
}

let monacoObj: typeof Monaco;
configureMonaco(MonacoLoader, "vs")
  .init()
  .then(async (inited: typeof Monaco) => {
    console.log("Monaco loaded");
    monacoObj = inited;

    const { default: schema } = await import("./schema.json");

    // Validate schemas.
    // http://json.schemastore.org/geojson
    monacoObj.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [
        {
          uri: "geojson-schema.json",
          fileMatch: [""],
          schema,
        },
      ],
    });
  });

interface Props {
  onChange: (code: string) => void;
  value: string;
  codeStatus: CodeStatus;
  isLargeFile: boolean;
}

// Owner for VSCode markers.
const OWNER = "geojsonError";

export function JsonEditor({
  onChange,
  codeStatus,
  value,
  isLargeFile,
}: Props) {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const editorRef = useRef<Monaco.editor.ICodeEditor>();
  const dark = usePreferDarkMode();

  // https://github.com/microsoft/monaco-css/blob/master/src/languageFeatures.ts
  useEffect(() => {
    if (monacoObj == null || !editorRef.current) {
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();

    if (codeStatus.tag === "geojsonError" && model) {
      const newDiagnostics: Diagnostic[] = codeStatus.errors.map((e) => {
        const range = monacoObj.Range.fromPositions(
          model.getPositionAt(e.offset),
          model.getPositionAt(e.offset + e.tokenLength)
        );

        return {
          severity: monacoObj.MarkerSeverity.Error,
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn,
          message: e.message,
          source: "GeoJSON Error",
        } as Diagnostic;
      });

      setDiagnostics(newDiagnostics);
      monacoObj.editor.setModelMarkers(model, OWNER, newDiagnostics);
    } else if (model) {
      setDiagnostics([]);
      monacoObj.editor.setModelMarkers(model, OWNER, []);
    }

    return () => {};
  }, [codeStatus]);

  const handleChange = (_: any, value?: string): void => {
    const newValue = value || "{}";
    onChange(newValue);
  };

  const init = (_valueGetter: any, _editor: any) => {
    editorRef.current = _editor;
    _editor.updateOptions({
      fontSize: 12,
      minimap: {
        enabled: false,
      },
    });
  };

  const [width, setWidth] = useState(350);
  const isDragging = useRef(false);

  useEffect(() => {
    console.log(document.body.clientWidth);

    const throttledResize = rafThrottle((e: MouseEvent) => {
      const width = document.body.clientWidth - e.clientX;
      setWidth(Math.max(width, 10));
    });

    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }
      throttledResize(e);
    };

    const handleStop = (e: MouseEvent) => {
      if (isDragging.current) {
        isDragging.current = false;
        window.dispatchEvent(new Event("resize"));
      }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleStop);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleStop);
    };
  }, []);

  const startDragging = (e: any) => {
    e.preventDefault();
    isDragging.current = true;
  };

  return (
    <div className="JsonEditor" style={{ width }}>
      <div className="JsonEditor__resizer" onMouseDown={startDragging} />
      <ControlledEditor
        height="100vh - 30px"
        language={isLargeFile ? "plaintext" : "json"}
        options={{ folding: !isLargeFile }}
        editorDidMount={init}
        value={value}
        onChange={handleChange}
        theme={dark ? "dark" : "light"}
      />
    </div>
  );
}

export default JsonEditor;
