import Button from "./Button";
import * as React from "react";
import "./ShareModal.css";

export function ShareModal({ parsed }: { parsed: any }) {
  const [hideEditor, setHideEditor] = React.useState(false);
  const [minimal, setMinimal] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const share = async () => {
    const { name } = await fetch(
      "https://63etfxlm03.execute-api.eu-west-1.amazonaws.com/dev/share",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsed)
      }
    ).then(x => x.json());
    setUrl(`http://playground.geojson.dev/?share=${name}`);
  };

  return (
    <div className="ShareModal">
      <div>
        <input
          type="checkbox"
          checked={hideEditor}
          onChange={() => setHideEditor(x => !x)}
          id="hideEditor"
        />
        <label htmlFor="hideEditor">Hide editor</label>
      </div>
      <div>
        <input
          id="minimal"
          type="checkbox"
          checked={minimal}
          onChange={() => setMinimal(x => !x)}
        />
        <label htmlFor="minimal">Minimal UI</label>
      </div>
      <Button onClick={share}>Share</Button>
      {url.length > 0 && (
        <div className="ShareModal__url">
          <input type="text" value={url} />
          <Button onClick={() => navigator.clipboard.writeText(url)}>
            Copy to clipboard
          </Button>
        </div>
      )}
    </div>
  );
}
