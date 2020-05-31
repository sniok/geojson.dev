const aws = require("aws-sdk");
const s3 = new aws.S3();
const crypto = require("crypto");
const codenamize = require("@codenamize/codenamize");
const geojsonhint = require("@mapbox/geojsonhint");

const fileName = (content) => {
  const md5 = crypto.createHash("md5").update(content).digest("hex");

  const codeName = codenamize({
    seed: md5,
    capitalize: true,
    separator: "",
    adjectiveCount: 2,
  });

  return codeName;
};

const Bucket = "geojson-dev-share";
const BadRequest = (why) => ({
  statusCode: 400,
  body: "Bad Request. " + why,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

module.exports.share = async (event) => {
  if (
    event.headers["content-type"] !== "application/json" &&
    event.headers["Content-Type"] !== "application/json"
  ) {
    return BadRequest("Not json");
  }

  if (event.body.length > 100e3) {
    return BadRequest("Request too big");
  }

  const errors = geojsonhint
    .hint(JSON.parse(event.body))
    .filter((it) => !it.message.includes("right-hand"));

  if (errors.length) {
    return BadRequest("invalid geojson " + JSON.stringify(errors));
  }

  const name = fileName(event.body);
  const Key = name + ".json";

  await s3
    .putObject({
      Body: event.body,
      Bucket,
      Key,
      ContentType: "application/json",
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ name }, null, 2),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
