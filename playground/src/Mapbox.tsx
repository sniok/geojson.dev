import React, { useContext, useEffect, useState, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import mapboxgl from "mapbox-gl";
import usePDM from "use-prefer-dark-mode";
import "mapbox-gl/dist/mapbox-gl.css";
import { blue400, blue700, black700, black400 } from "./colors";

const MapContext = React.createContext<mapboxgl.Map>(undefined as any);

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
      container: "mapbox",
    });
    m.on("load", () => {
      setMap(m);
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
