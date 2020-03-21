import React, { useRef, useEffect, useState } from "react";
import Editor, { monaco } from "@monaco-editor/react";
import usePDM from "use-prefer-dark-mode";
import { codeStatus } from "./useParsedGeojson";
import schema from "./GeoJSON.json";

let inited: any = null;
// monaco.init().then(x => {
//   inited = x;
// });

monaco.init().then((monaco: any) => {
  console.log(monaco, schema);
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    // validate: true,
    // schemas: [
    //   {
    //     filesMatch: ["*"],
    //     schema
    //   }
    // ]
    validate: true,
    schemas: [
      {
        uri: "http://myserver/foo-schema.json", // id of the first schema
        fileMatch: ["*"], // associate with our model
        schema: {
          type: "object",
          properties: {
            p1: {
              enum: ["v1", "v2"]
            }
          }
        }
      },
      {
        uri: "http://myserver/kek.json",
        fileMatch: ["*"],
        schema
      }
    ]
  });
});

interface Props {
  onChange: (code: string) => void;
  value: string;
  codeStatus: codeStatus;
}
export function JsonEditor(props: Props) {
  const [decorations, setDecorations] = useState<any[]>([]);
  const editor = useRef<any>();
  const dark = usePDM();

  useEffect(() => {
    return;
    // if (!editor.current) {
    //   return;
    // }
    // if (props.codeStatus.tag === "geojsonError") {
    //   const newDecorations = props.codeStatus.errors.map(e => ({
    //     range: new inited.Range(e.line + 1, 1, e.line + 1, Infinity),
    //     options: {
    //       isWholeLine: true,
    //       className: "editor__error-line",
    //       hoverMessage: { value: e.message }
    //     }
    //   }));
    //   const ids = editor.current.deltaDecorations(decorations, newDecorations);
    //   setDecorations(ids);
    // } else {
    //   editor.current.deltaDecorations(decorations, []);
    //   setDecorations([]);
    // }
  }, [props.codeStatus]);

  const handleChange = () => {
    if (editor.current) {
      props.onChange(editor.current.getValue());
    }
  };

  const init = (_valueGetter: any, _editor: any) => {
    editor.current = _editor;
    _editor.updateOptions({
      fontSize: 11,
      minimap: {
        enabled: false
      }
    });
    _editor.onDidChangeModelContent(handleChange);
    const d = async () => {};
    d();
  };

  return (
    <div id="editor">
      <Editor
        height="100vh - 30px"
        language="json"
        editorDidMount={init}
        value={props.value}
        theme={dark ? "dark" : "light"}
      />
    </div>
  );
}

export default JsonEditor;
