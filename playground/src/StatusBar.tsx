import React from "react";
import { CodeStatus } from "./useParsedGeojson";
import "./StatusBar.css";

interface Props {
  codeStatus: CodeStatus;
  byteLength: number;
}

function StatusBar(props: Props) {
  const status: any = {
    ok: "Ok",
    jsonError: "Out of sync",
    geojsonError: "Out of sync",
  }[props.codeStatus.tag];

  return (
    <div className="StatusBar">
      <div className="StatusBar__status"><b>Status:</b> {status} <b>Byte Length:</b> {props.byteLength}B</div>
      <div className="StatusBar__info">playground.geojson.dev</div>
    </div>
  );
}

export default StatusBar;
