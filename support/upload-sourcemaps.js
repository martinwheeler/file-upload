const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.development")
});
const upload = require("bugsnag-sourcemaps").upload;
const packageJSON = require("../package.json");

console.log(path.resolve(__dirname, "../dist/"));

upload(
  {
    apiKey: process.env.BUGSNAG_ID,
    appVersion: packageJSON.version,
    directory: path.resolve(__dirname, "../dist/"),
    overwrite: true
  },
  function(err) {
    if (err) {
      throw new Error("Something went wrong! " + err.message);
    }
    console.log(
      "Sourcemap was uploaded successfully for version: " + packageJSON.version
    );
  },
  function() {
    console.log("Done?");
  }
);
