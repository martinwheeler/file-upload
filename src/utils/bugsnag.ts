import bugsnag from "@bugsnag/js";
import { notify } from "./slack";
import packageJson from "../../package.json";

let bugsnagClient = {
  notify: notify
};

const stageMap = {
  test: "Test",
  production: "Production",
  default: "Development"
};
const currentEnv = process.env.NODE_ENV;
const releaseStage = stageMap[currentEnv] || stageMap.default;

if (process.env.NODE_ENV !== "test") {
  bugsnagClient = bugsnag({
    apiKey: process.env.BUGSNAG_ID,
    appVersion: packageJson.version,
    releaseStage
  });
}

export { bugsnagClient };
