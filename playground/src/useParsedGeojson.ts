import { useState, useEffect } from "react";
import { FeatureCollection } from "@turf/turf";
import geojsonhint from "@mapbox/geojsonhint";
import { toCollection } from "./geojsonUtils";

export type codeStatus =
  | { tag: "ok" }
  | { tag: "jsonError" }
  | { tag: "geojsonError"; errors: { message: string; line: number }[] };

export const useParsedGeojson = (
  code: string
): { parsed: FeatureCollection; codeStatus: codeStatus } => {
  const [parsed, setParsed] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [codeStatus, setCodeStatus] = useState<codeStatus>({ tag: "ok" });

  useEffect(() => {
    try {
      const p = JSON.parse(code);
      const errors = geojsonhint.hint(p);

      if (errors.length) {
        // Create more detailed erros
        const detailedErrors = geojsonhint
          .hint(code)
          .filter((it: any) => !it.message.includes("right-hand"));
        setCodeStatus({ tag: "geojsonError", errors: detailedErrors });
        return;
      }
      if (codeStatus.tag !== "ok") {
        setCodeStatus({ tag: "ok" });
      }
      setParsed(toCollection(p));
    } catch (e) {
      console.log(e);
      setCodeStatus({ tag: "jsonError" });
    }
  }, [code]);

  return { parsed, codeStatus };
};
