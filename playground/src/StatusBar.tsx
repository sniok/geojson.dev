import React from "react";
import { codeStatus } from "./useParsedGeojson";
import "./StatusBar.css";

interface Props {
  codeStatus: codeStatus;
}
function StatusBar(props: Props) {
  const status: any = {
    ok: "Ok",
    jsonError: "Out of sync",
    geojsonError: "Out of sync",
  }[props.codeStatus.tag];
  return (
    <div className="StatusBar">
      <div className="StatusBar__status">Status: {status}</div>
      <div className="StatusBar__info">playground.geojson.dev</div>
    </div>
  );
}
export default StatusBar;
