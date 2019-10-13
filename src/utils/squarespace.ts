import get from "lodash/get";

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

export { getDialogType, DIALOG_TYPE, USER_ID };
