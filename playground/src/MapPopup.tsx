import { ReactNode, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createPortal } from "react-dom";
import { useMap } from "./Mapbox";

interface Props {
  lngLat: { lng: number; lat: number };
  children: ReactNode;
}
function MapPopup({ lngLat, children }: Props) {
  const [popup, setPopup] = useState<mapboxgl.Popup>();
  const map = useMap();

  useEffect(() => {
    const p = new mapboxgl.Popup()
      .setLngLat(lngLat)
      .setHTML("")
      .addTo(map);
    setPopup(p);

    return () => {
      p.remove();
    };
  }, []);

  useEffect(() => {
    if (!popup) {
      return;
    }
    popup.setLngLat(lngLat);
  }, [lngLat]);

  if (!popup) {
    return null;
  }

  return createPortal(children, (popup as any)._content);
}

export default MapPopup;
