import { Layer } from "mapbox-gl";
import {
  blue100,
  black100,
  blue800,
  black800,
  black400,
  blue400,
  blue700,
  black700,
} from "./colors";

export const fillLayer: Layer = {
  id: "fill-fill",
  type: "fill",
  paint: { "fill-color": blue100 },
};
export const fillLayerLight: Layer = {
  id: "fill-fill",
  type: "fill",
  paint: { "fill-color": black100 },
};
export const pointLayer: Layer = {
  id: "point",
  type: "circle",
  paint: {
    "circle-radius": 4,
    "circle-color": blue700,
    "circle-stroke-color": blue400,
    "circle-stroke-width": 3,
  },
};
export const pointLayerLight: Layer = {
  id: "point",
  type: "circle",
  paint: {
    "circle-radius": 4,
    "circle-color": black700,
    "circle-stroke-color": black400,
    "circle-stroke-width": 3,
  },
};
export const linesLayer: Layer = {
  id: "lines",
  type: "line",
  paint: { "line-color": blue800, "line-width": 3 },
};
export const linesLayerLight: Layer = {
  id: "lines",
  type: "line",
  paint: { "line-color": black400, "line-width": 3 },
};
