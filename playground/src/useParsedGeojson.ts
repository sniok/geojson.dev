import { useState, useEffect } from "react";
import { FeatureCollection, Id } from "@turf/turf";

import geojsonhint from "@mapbox/geojsonhint";
import * as VSJSON from "./json";

import { Nullable } from "./types";

export type CodeStatus =
  | { tag: "ok" }
  | { tag: "jsonError"; errors: VSJSON.ParseError[] }
  | {
      tag: "geojsonError";
      errors: { message: string; offset: number; tokenLength: number }[];
    };

export type IDMap = Nullable<Map<number, Id>>;

export const useParsedGeojson = (
  code: string
): { parsed: FeatureCollection; codeStatus: CodeStatus; idMap: IDMap } => {
  const [parsed, setParsed] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [codeStatus, setCodeStatus] = useState<CodeStatus>({ tag: "ok" });
  const [idMap, setIDMap] = useState<IDMap>(null);

  useEffect(() => {
    const errors: VSJSON.ParseError[] = [];

    const newIDMap = new Map<number, Id>();
    let i: number = 0;
    const p = VSJSON.parseWithLines(code, errors, VSJSON.ParseOptions.DEFAULT, (object) => {
      if (object.type === 'Feature') {
        if (object.id != null) {
          newIDMap.set(i, object.id);
        }
        object.id = i++;
      }
    });

    if (errors.length) {
      setCodeStatus({ tag: "jsonError", errors });
      return;
    }

    const geoErrors = geojsonhint.hint(p);

    if (geoErrors.length) {
      // Create more detailed erros
      const detailedErrors = geoErrors
        .filter((it: any) => !it.message.includes("right-hand"))
        .map((e: any) => {
          const { message, line } = e;

          return {
            offset: line[0],
            tokenLength: line[1],
            // Convert from geojsonhint style to proper English.
            // Example: this is an error --> This is an error.
            message:
              message.charAt(0).toUpperCase() + message.substring(1) + ".",
          };
        });

      setCodeStatus({ tag: "geojsonError", errors: detailedErrors });
      return;
    }

    if (codeStatus.tag !== "ok") {
      setCodeStatus({ tag: "ok" });
    }

    setIDMap(newIDMap);
    setParsed(p);
  }, [code]);

  return { parsed, codeStatus, idMap };
};
