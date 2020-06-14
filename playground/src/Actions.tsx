import React, { useCallback } from "react";
import "./Actions.css";
import { saveAs } from "file-saver";
import { ShareModal } from "./ShareModal";

export function Actions({
  code,
  onGeojson,
}: {
  code: string;
  onGeojson: (p: any) => void;
}) {
  const onOpen = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener(
      "change",
      async (e) => {
        if (input.files === null) {
          return;
        }
        const file = input.files[0];
        const text = await (file as any).text();
        try {
          JSON.parse(text);
          onGeojson(text);
        } catch (e) {
          console.error("Invalid JSON", e);
        }
      },
      false
    );
  }, [onGeojson]);

  const onSave = () => {
    const blob = new Blob([code], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, "geometry.json");
  };

  const [shareModal, setShareModal] = React.useState(false);

  return (
    <div className="Actions">
      <button className="Actions__action" onClick={onOpen}>
        Open
      </button>
      <button className="Actions__action" onClick={onSave}>
        Download
      </button>
      <button
        className="Actions__action"
        onClick={() => setShareModal((x) => !x)}
      >
        Share
      </button>
      {shareModal && <ShareModal code={code} />}
    </div>
  );
}
