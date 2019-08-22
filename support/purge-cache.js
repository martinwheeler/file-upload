const fetch = require("node-fetch");
const parseString = require("xml2js").parseString;
const packageJson = require("../package.json");
const get = require("lodash/get");

const baseUrl = "https://purge.jsdelivr.net/";

const filesToPurge = {
  path: [
    `/gh/martinwheeler/undress-plugins@${packageJson.version}/dist/index.js`,
    "/gh/martinwheeler/undress-plugins@latest/dist/index.js"
    // `/gh/martinwheeler/undress-plugins@${packageJson.version}/src/styles.css`,
    // "/gh/martinwheeler/undress-plugins@latest/src/styles.css"
  ]
};

function purgeCache() {
  return fetch(baseUrl, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/json"
    },
    body: JSON.stringify(filesToPurge)
  })
    .then(response => response.json())
    .then(result => {
      console.warn("RESULT: ", result);
      if (result.quantil) {
        const XMLString = result.quantil.error
          ? result.quantil.error.replace("400 - ", "")
          : result.quantil;

        return new Promise((resolve, reject) => {
          parseString(XMLString, (error, result) => {
            if (error) {
              reject(error);
            }

            resolve(result);
          });
        });
      }
    });
}

purgeCache()
  .then(response => {
    const message = get(response, "response.message[0]");
    if (message === "success") {
      console.log("Cache purged successfully.");
    } else {
      console.error(
        "Cache was not purged! Please make sure you clear it manually or update the scripts to use the latest version tag: ",
        packageJson.version
      );
    }
  })
  .catch(error => {
    console.error(error);
  });
