/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: "geojson.dev",
  tagline: "Geospatial data format based on JSON",
  url: "https://geojson.dev",
  baseUrl: "/",
  favicon: "img/favicon.png",
  organizationName: "no", // Usually your GitHub org/user name.
  projectName: "no", // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      title: "geojson.dev",
      logo: {
        alt: "geojson.dev Logo",
        src: "img/favicon.png"
      },
      links: [
        { to: "docs/intro", label: "Learn", position: "left" },
        {
          to: "http://playground.geojson.dev/",
          label: "Playground",
          position: "left"
        },
        {
          href: "https://github.com/sniok/geojson.dev",
          label: "GitHub",
          position: "right"
        }
      ]
    }
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js")
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ]
};
