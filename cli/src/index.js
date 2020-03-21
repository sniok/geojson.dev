const path = require("path");
const fs = require("fs");
const program = require("commander");
const express = require("express");
const getPort = require("get-port");
const validate = require("./validator");

const serveFile = async file => {
  const fileContents = fs.readFileSync(file, { encoding: "utf-8" });
  const validationErrors = validate(fileContents);
  if (validationErrors) {
    console.log("Failed to open geojson file");
    console.log(validationErrors);
    return;
  }
  const app = express();
  const port = await getPort();
  app.use(require("cors")());
  app.get("/geojson", (req, res) => {
    res.sendFile(path.resolve(file));
  });
  app.listen(port, () =>
    console.log(
      `https://playground.geojson.dev/?p=http://localhost:${port}/geojson`
    )
  );
};

program
  .command("open <file>")
  .description("open GeoJSON file in a playground")
  .action(serveFile);

program.parse(process.argv);
