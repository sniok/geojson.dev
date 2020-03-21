import React from "react";
import { codeStatus } from "./useParsedGeojson";

interface Props {
  codeStatus: codeStatus;
}
function StatusBar(props: Props) {
  const status: any = {
    ok: "Ok",
    jsonError: "Out of sync",
    geojsonError: "Out of sync"
  }[props.codeStatus.tag];
  return <div className="StatusBar">Status: {status}</div>;
}
export default StatusBar;
