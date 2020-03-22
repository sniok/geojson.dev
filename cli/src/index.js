#! /usr/bin/env node
const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs").promises;
const program = require("commander");
const express = require("express");
const getPort = require("get-port");
const validate = require("./validator");

const MAX_SIZE = 10 * 1000000;

const playgroundUrl = `https://playground.geojson.dev`;

const makeUrl = (path, params) => {
  let query = ``;
  if (!params.editor) {
    query += "&hideEditor=1";
  }
  if (params.minimal) {
    query += "&minimal=1";
  }
  return `${playgroundUrl}${path}${query}`;
};

const parseGeojsonFile = async file => {
  const { size } = fs.stat(file);
  if (size > MAX_SIZE) {
    throw new Error("File is too large. Max size is " + MAX_SIZE + " bytes");
  }

  const content = await fs.readFile(file, { encoding: "utf-8" });
  const errors = validate(content);

  if (errors) {
    throw new Error(errors);
  }

  return content;
};

const open = async (file, params) => {
  try {
    await parseGeojsonFile(file);
  } catch (e) {
    console.log("Failed to open GeoJSON file");
    console.log(e);
    return;
  }

  // Start express server
  const app = express();
  const port = await getPort();
  app.use(require("cors")());

  app.get("/geojson", (req, res) => {
    res.sendFile(path.resolve(file));
  });

  app.listen(port, () =>
    // console.log(`${playgroundUrl}/?url=http://localhost:${port}/geojson`)
    console.log(makeUrl(`/url?=http://localhost:${port}/geojson`, params))
  );
};

const share = async (file, params) => {
  let geojson;
  try {
    geojson = await parseGeojsonFile(file);
  } catch (e) {
    console.log("Failed to open GeoJSON file");
    console.log(e);
    return;
  }

  console.log("Uploading...");

  try {
    const response = await fetch(
      "https://63etfxlm03.execute-api.eu-west-1.amazonaws.com/dev/share",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: geojson
      }
    ).then(x => x.json());

    console.log(`
      Shared file
      ${makeUrl(`/?share=${response.name}`, args)}
      `);
  } catch (e) {
    console.log(e);
  }
};

const openUrl = async (url, params) => {
  console.log(`
      Open this link
      ${makeUrl(`/?url=${url}`, params)}
      `);
};

program
  .option(
    "-n, --no-editor",
    "hide editor, useful for big files or just presentation"
  )
  .option("-m, --minimal", "use minimal interface");

program
  .command("open <file>")
  .description("open local GeoJSON file in a playground")
  .action(open);

program
  .command("open-url <url>")
  .description("open from URL")
  .action(openUrl);

program
  .command("share <file>")
  // .option(
  //   "-n, --no-editor",
  //   "hide editor, useful for big files or just presentation"
  // )
  // .option("-m, --minimal", "use minimal interface")
  .description("share a GeoJSON file")
  .action(share);

program.parse(process.argv);
