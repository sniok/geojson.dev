import React from "react";

function CodeWithMap(props) {
  const encodedJson = React.useMemo(
    () => encodeURIComponent(JSON.stringify(props.geojson)),
    [props.geojson]
  );
  return (
    <div>
      <iframe
        width="100%"
        height={props.height || "340"}
        src={`https://playground.geojson.dev/?json=${encodedJson}&minimal=1`}
      ></iframe>
    </div>
  );
}

export default CodeWithMap;
