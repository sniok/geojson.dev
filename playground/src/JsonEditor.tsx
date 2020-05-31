import React, { useRef, useEffect, useState } from "react";
import Editor, { monaco } from "@monaco-editor/react";
import usePDM from "use-prefer-dark-mode";
import { codeStatus } from "./useParsedGeojson";
import "./JsonEditor.css";
import { rafThrottle } from "./rafThrottle";

let inited: any = null;
monaco.init().then((x) => {
  inited = x;
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
    if (!editor.current) {
      return;
    }
    if (props.codeStatus.tag === "geojsonError") {
      const newDecorations = props.codeStatus.errors.map((e) => ({
        range: new inited.Range(e.line + 1, 1, e.line + 1, Infinity),
        options: {
          isWholeLine: true,
          className: "editor__error-line",
          hoverMessage: { value: e.message },
        },
      }));
      const ids = editor.current.deltaDecorations(decorations, newDecorations);
      setDecorations(ids);
    } else {
      editor.current.deltaDecorations(decorations, []);
      setDecorations([]);
    }
  }, [props.codeStatus]);

  const handleChange = () => {
    if (editor.current) {
      props.onChange(editor.current.getValue());
    }
  };

  const init = (_valueGetter: any, _editor: any) => {
    editor.current = _editor;
    _editor.updateOptions({
      fontSize: 12,
      minimap: {
        enabled: false,
      },
    });
    _editor.onDidChangeModelContent(handleChange);
    const d = async () => {};
    d();
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
