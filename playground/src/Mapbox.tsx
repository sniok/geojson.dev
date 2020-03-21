import React, { useContext, useEffect, useState, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import mapboxgl from "mapbox-gl";
import usePDM from "use-prefer-dark-mode";
import "mapbox-gl/dist/mapbox-gl.css";
import { blue400, blue700, black700, black400 } from "./colors";

const MapContext = React.createContext<mapboxgl.Map>(undefined as any);

const circleIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle cx="8" cy="8" r="8" fill={blue400}></circle>
    <circle cx="8" cy="8" r="3" fill={blue700}></circle>
  </svg>
);
const circleIconLight = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle cx="8" cy="8" r="8" fill={black400}></circle>
    <circle cx="8" cy="8" r="3" fill={black700}></circle>
  </svg>
);

const addImage = (node: ReactNode, name: string, map: mapboxgl.Map) => {
  const svgString = encodeURIComponent(renderToStaticMarkup(node as any));
  const dataUri = `data:image/svg+xml,${svgString}`;
  const image = document.createElement("img");
  image.src = dataUri;
  image.height = 16;
  image.width = 16;
  image.onload = () => {
    map.addImage(name, image);
  };
};

export const useMap = () => useContext(MapContext);
function Mapbox({ children, mapRef }: any) {
  const [map, setMap] = useState<mapboxgl.Map | undefined>(undefined);
  const dark = usePDM();

  useEffect(() => {
    const m = new mapboxgl.Map({
      style: dark
        ? "https://api.maptiler.com/maps/darkmatter/style.json?key=RaJjJYR0TdIqppDZ4yb1"
        : "https://api.maptiler.com/maps/basic/style.json?key=RaJjJYR0TdIqppDZ4yb1",
      center: [0, 0],
      zoom: 1,
      container: "mapbox"
    });
    m.on("load", () => {
      setMap(m);
      addImage(circleIcon, "circle-icon", m);
      addImage(circleIconLight, "circle-icon-light", m);
      if (mapRef) {
        mapRef.current = m;
      }
    });
  }, []);

  useEffect(() => {
    if (map) {
      map.setStyle(
        dark
          ? "https://api.maptiler.com/maps/darkmatter/style.json?key=RaJjJYR0TdIqppDZ4yb1"
          : "https://api.maptiler.com/maps/basic/style.json?key=RaJjJYR0TdIqppDZ4yb1"
      );
    }
  }, [dark]);

  return (
    <div id="mapbox">
      <MapContext.Provider value={map as any}>
        {map ? children : null}
      </MapContext.Provider>
    </div>
  );
}

export default Mapbox;
