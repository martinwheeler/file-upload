import { notify } from "./slack";
import get from "lodash/get";

function checkVersion() {
  const previousVersion = localStorage.getItem("squareSpaceVersion");
  const currentVersion = Array.prototype.slice
    .call(document.scripts)
    .map(scriptElement => {
      const remoteSrc = scriptElement.getAttribute("src");
      if (remoteSrc && remoteSrc.includes("squarespace.com")) {
        const [, bundleHash = null] =
          /[-\/]([a-f0-9]+)[-\/]/gi.exec(remoteSrc) || [];
        return bundleHash;
      }
      return null;
    })
    .filter(Boolean)
    .join("-");

  if (!previousVersion) {
    console.warn("🚧 NO PRIOR VERSION");
    console.warn("🚧 SETTING VERSION: ", currentVersion);
    localStorage.setItem("squareSpaceVersion", currentVersion);
    return;
  }

  if (previousVersion !== currentVersion) {
    console.group("🚧 VERSION MISMATCH");
    console.warn("OLD: ", previousVersion);
    console.warn("NEW: ", currentVersion);
    console.groupEnd();

    localStorage.setItem("squareSpaceVersion", currentVersion);

    const versionChangeMessage = {
      username: "File Uploader",
      attachments: [
        {
          fallback: `A new version of Squarespace has been released.\nOld Version: \`${previousVersion}\`\nNew Version: \`${currentVersion}\``,
          pretext: "A new version of Squarespace has been released.",
          color: "#D00000",
          fields: [
            {
              title: "Mismatch",
              value: `From: \`${previousVersion}\` to \`${currentVersion}\``,
              short: false
            }
          ]
        }
      ]
    };

    notify(versionChangeMessage);
  }
}

const DIALOG_TYPE = {
  EDIT: "edit",
  ADD: "add",
  PAGE_SETTINGS: "page-settings"
};

function getDialogType(dialog) {
  const dialogTitle =
    (dialog.titleTextEl && dialog.titleTextEl.get("textContent")) ||
    (dialog.params && dialog.params.title);

  const pageSettingsDialog =
    dialog.params &&
    dialog.params.initialData &&
    dialog.params.initialData.navigationTitle &&
    dialog.params.initialData.urlId;

  if (pageSettingsDialog) {
    return DIALOG_TYPE.PAGE_SETTINGS;
  }

  const typeMapping = {
    "Add Form Field": DIALOG_TYPE.ADD,
    "Edit Form": DIALOG_TYPE.EDIT
  };

  return typeMapping[dialogTitle] || undefined;
}

const { Static } = window;
const USER_ID = `${get(Static, "SQUARESPACE_CONTEXT.website.identifier")}-${get(
  Static,
  "SQUARESPACE_CONTEXT.website.id"
)}`;

export { checkVersion, getDialogType, DIALOG_TYPE, USER_ID };
