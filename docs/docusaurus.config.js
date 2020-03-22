module.exports = {
  title: "geojson.dev",
  tagline: "Geospatial data format based on JSON",
  url: "https://geojson.dev",
  baseUrl: "/",
  favicon: "img/favicon.png",
  organizationName: "no", // Usually your GitHub org/user name.
  projectName: "no", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "geojson.dev",
      logo: {
        alt: "geojson.dev logo",
        src: "img/favicon.png"
      },
      links: [
        {
          to: "docs/intro",
          activeBasePath: "docs",
          label: "Learn",
          position: "left"
        },
        {
          to: "https://playground.geojson.dev",
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
    // footer: {
    //   style: 'dark',
    //   links: [
    //     {
    //       title: 'Docs',
    //       items: [
    //         {
    //           label: 'Style Guide',
    //           to: 'docs/doc1',
    //         },
    //         {
    //           label: 'Second Doc',
    //           to: 'docs/doc2',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Community',
    //       items: [
    //         {
    //           label: 'Stack Overflow',
    //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
    //         },
    //         {
    //           label: 'Discord',
    //           href: 'https://discordapp.com/invite/docusaurus',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Social',
    //       items: [
    //         {
    //           label: 'Blog',
    //           to: 'blog',
    //         },
    //         {
    //           label: 'GitHub',
    //           href: 'https://github.com/facebook/docusaurus',
    //         },
    //         {
    //           label: 'Twitter',
    //           href: 'https://twitter.com/docusaurus',
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    // },
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
