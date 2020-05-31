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

const makeUrl = (path) => {
  let query = ``;
  if (program.hideEditor) {
    query += "&hideEditor=1";
  }
  if (program.minimal) {
    query += "&minimal=1";
  }
  return `${playgroundUrl}${path}${query}`;
};

const parseGeojsonFile = async (file) => {
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
  console.log("Reading file...");
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

  app.listen(port, () => {
    console.log("Ready, open following URL:");
    console.log(makeUrl(`/?url=http://localhost:${port}/geojson`, params));
  });
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
          "Content-Type": "application/json",
        },
        body: geojson,
      }
    ).then((x) => x.json());

    console.log(`
      Shared file
      ${makeUrl(`/?share=${response.name}`, params)}
      `);
  } catch (e) {
    console.log(e);
  }
};

program
  .option(
    "-he, --hide-editor",
    "hide editor, useful for big files or just presentation"
  )
  .option("-m, --minimal", "use minimal interface");

program
  .command("open <file>")
  .description("open local GeoJSON file in a playground")
  .action(open);

program
  .command("share <file>")
  .description("share a GeoJSON file")
  .action(share);

program.parse(process.argv);
