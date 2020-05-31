import { Layer } from "mapbox-gl";
import { blue100, black100, blue800, black800, black400 } from "./colors";

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
export const lineLayer: Layer = {
  id: "line",
  type: "line",
  paint: { "line-color": blue800, "line-width": 3 },
};
export const lineLayerLight: Layer = {
  id: "line",
  type: "line",
  paint: { "line-color": black400, "line-width": 3 },
};
export const pointLayer: Layer = {
  id: "point",
  type: "symbol",
  layout: {
    "icon-image": "circle-icon",
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  },
  paint: {
    "icon-opacity": 1,
    "icon-opacity-transition": {
      duration: 0,
    },
  },
};
export const pointLayerLight: Layer = {
  id: "point",
  type: "symbol",
  layout: {
    "icon-image": "circle-icon-light",
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
  },
  paint: {
    "icon-opacity": 1,
    "icon-opacity-transition": {
      duration: 0,
    },
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
