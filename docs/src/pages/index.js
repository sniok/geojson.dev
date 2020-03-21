import React, { useEffect } from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import CodeWidthMap from "../components/CodeWithMap";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import usePDM from "use-prefer-dark-mode";

function Home() {
  return (
    <Layout
      title={`geojson.dev`}
      description="GeoJSON is an open format for encoding variety of geographic data structures"
    >
      <header className={classnames("hero", styles.heroBanner)}>
        <div className={styles.container}>
          <div className="container__info">
            <h1 className="hero__title">GeoJSON</h1>
            <p className="hero__subtitle">
              Open format for encoding variety of geographic data structures
            </p>
            <div className={styles.buttons}>
              <Link
                className={classnames(
                  "button button--outline button--secondary button--lg",
                  styles.getStarted
                )}
                to={useBaseUrl("docs/intro")}
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className={styles["container__demo"]}>
            <CodeWidthMap
              geojson={{
                type: "LineString",
                coordinates: [
                  [3.2, 4.5],
                  [12.3, 23.2],
                  [15.3, 3.2]
                ]
              }}
              height={500}
            />
          </div>
        </div>
      </header>
    </Layout>
  );
}

export default Home;
