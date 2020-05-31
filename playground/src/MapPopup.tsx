import { ReactNode, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createPortal } from "react-dom";
import { useMap } from "./Mapbox";

interface Props {
  lngLat: { lng: number; lat: number };
  children: ReactNode;
  onClose: () => any;
}
function MapPopup({ lngLat, children, onClose }: Props) {
  const [popup, setPopup] = useState<mapboxgl.Popup>();
  const map = useMap();

  useEffect(() => {
    const p = new mapboxgl.Popup().setLngLat(lngLat).setHTML("").addTo(map);
    setPopup(p);

    const handleClose = () => {
      onClose();
    };

    p.on("close", handleClose);

    return () => {
      p.off("close", handleClose);
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
