import Button from "./Button";
import * as React from "react";
import "./ShareModal.css";

export function ShareModal({ code }: { code: string }) {
  const [hideEditor, setHideEditor] = React.useState(false);
  const [minimal, setMinimal] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const share = async () => {
    setLoading(true);
    try {
      const { name } = await fetch(
        "https://63etfxlm03.execute-api.eu-west-1.amazonaws.com/dev/share",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: code,
        }
      ).then((x) => x.json());
      const params = new URLSearchParams();
      params.set("share", name);
      if (hideEditor) {
        params.set("hideEditor", "1");
      }
      if (minimal) {
        params.set("minimal", "1");
      }
      setUrl(`http://playground.geojson.dev/?${params.toString()}`);
      setLoading(false);
    } catch (e) {
      setError("upload failed :(");
      setLoading(false);
    }
  };

  return (
    <div className="ShareModal">
      Create a permanent link to this view
      <div className="ShareModal__input">
        <input
          type="checkbox"
          checked={hideEditor}
          onChange={() => setHideEditor((x) => !x)}
          id="hideEditor"
        />
        <label htmlFor="hideEditor">Hide editor</label>
      </div>
      <div className="ShareModal__input">
        <input
          id="minimal"
          type="checkbox"
          checked={minimal}
          onChange={() => setMinimal((x) => !x)}
        />
        <label htmlFor="minimal">Minimal UI</label>
      </div>
      <Button onClick={share}>Share</Button>
      {loading && <div>Uploading...</div>}
      {error !== undefined && <div>{error}</div>}
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
