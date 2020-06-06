import { useState, useEffect } from "react";
import { FeatureCollection, Id } from "@turf/turf";
import geojsonhint from "@mapbox/geojsonhint";
import { toCollection } from "./geojsonUtils";
import { Nullable } from "./types";

export type codeStatus =
  | { tag: "ok" }
  | { tag: "jsonError" }
  | { tag: "geojsonError"; errors: { message: string; line: number }[] };

export type IDMap = Nullable<Map<number, Id>>;

export const useParsedGeojson = (
  code: string
): { parsed: FeatureCollection; codeStatus: codeStatus, idMap: IDMap } => {
  const [parsed, setParsed] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [codeStatus, setCodeStatus] = useState<codeStatus>({ tag: "ok" });
  const [idMap, setIDMap] = useState<IDMap>(null);

  useEffect(() => {
    try {
      const p = JSON.parse(code);
      const errors = geojsonhint.hint(p);

      if (errors.length) {
        // Create more detailed erros
        const detailedErrors = geojsonhint
          .hint(code)
          .filter((it: any) => !it.message.includes("right-hand"))
          .map((e: any) => {
            const message: string = e.message;

            if (!message || !message.length) {
              return e
            }

            return {
              ...e,
              // Convert from geojsonhint style to proper English.
              //
              // Example: this is an error --> This is an error.
              message: message.charAt(0).toUpperCase() + message.substring(1) + '.'
            }
          });
        setCodeStatus({ tag: "geojsonError", errors: detailedErrors });
        return;
      }
      if (codeStatus.tag !== "ok") {
        setCodeStatus({ tag: "ok" });
      }

      const collection = toCollection(p);

      const map = new Map<number, Id>();
      // Set IDs.
      for (let i = 0; i < collection.features.length; i++) {
        const feature = collection.features[i];
        if (feature.id != null) {
          map.set(i, feature.id);
        }
        feature.id = i;
      }

      setIDMap(map);
      setParsed(collection);
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        console.log(e);
      }
      setCodeStatus({ tag: "jsonError" });
    }
  }, [code]);

  return { parsed, codeStatus, idMap };
};
