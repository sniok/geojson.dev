import * as React from "react";
import { Feature } from "@turf/helpers";
import ReactJson from "react-json-view";
import "./FeatureInfo.css";

export function FeatureInfo({ feature }: { feature: Feature }) {
  return (
    <div className="FeatureInfo">
      <ReactJson
        src={feature}
        displayDataTypes={false}
        displayObjectSize={false}
        collapsed={2}
        iconStyle="square"
        enableClipboard={false}
        theme={{
          base00: "rgba(0, 0, 0, 0)",
          base01: "rgb(245, 245, 245)",
          base02: "rgb(235, 235, 235)",
          base03: "#93a1a1",
          base04: "rgba(0, 0, 0, 0.3)",
          base05: "red",
          base06: "#073642",
          base07: "#9cdcfe",
          base08: "#d33682",
          base09: "#ce9178",
          base0A: "#dc322f",
          base0B: "#859900",
          base0C: "#6c71c4",
          base0D: "#aeaeae",
          base0E: "#dcdcdc",
          base0F: "#268bd2"
        }}
        sortKeys={true}
        collapseStringsAfterLength={50}
      />
    </div>
  );
}
