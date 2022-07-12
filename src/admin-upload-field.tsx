import { render } from "react-dom";

import { injectStyleSheet } from "./utils/styling";
import { getDialogType, DIALOG_TYPE } from "./utils/squarespace";
import { bugsnagClient } from "./utils/bugsnag";

import Uploads from "./components/uploads";

export const UPLOAD_FIELD_CONFIG = {
  icon: "file",
  title: "Upload Files",
  value: {
    description:
      "FileField;MaxSize=10240;Multiple;ButtonLabel=Add_Your_Files;RequiredField=Email;RequiredFieldMessage=Enter_your_email_before_uploading_your_files.",
    placeholder: ".jpg, .jpeg, .png, .gif, .txt",
    type: "textarea",
    title: "Upload Files",
    id: null,
    required: false,
    textarea: true,
  },
};

/**
 * Handles injecting the custom upload field when adding a new field.
 * Also handles injecting the custom upload field when editing the
 * fields.
 *
 * @param {*} a
 */
function dialogInit(element) {
  const error = new Error();

  if (element && element.currentTarget) {
    const dialog = element.currentTarget;

    dialog.onceAfter("rendered", () => {
      const currentDialog = getDialogType(dialog);

      if (currentDialog === undefined) {
        error.message = "User could not detect which dialog opened.";
        bugsnagClient.notify(error);
      }

      // Shows the field when adding a form field
      if (currentDialog === DIALOG_TYPE.ADD) {
        // Gets the form field options that will be shown
        const formFields = dialog.fields.fieldOptions;
        const options = formFields.get("options");

        // Injects the upload file option at the top of the list
        if (options[0].icon !== "file") {
          options.unshift(UPLOAD_FIELD_CONFIG);

          // Updates the options the user will see
          formFields.set("options", options);
        }
      }

      // Shows the field when editing the form fields
      if (currentDialog === DIALOG_TYPE.EDIT) {
        const fields = dialog.getField("fields");
        fields.after("dataChange", function () {
          fields
            .get("contentBox")
            .all(".sqs-form-builder-field")
            .each(function (field) {
              if (
                field.one('textarea[placeholder="Description"]') &&
                field
                  .one('textarea[placeholder="Description"]')
                  .get("innerText")
                  .indexOf("FileField;") > -1
              ) {
                field.addClass("icon-file");
              }
            });
        });
      }
    });
  }
}

function uploadDialogInit(element) {
  if (element && element.currentTarget) {
    const dialog = element.currentTarget;
    const currentDialog = getDialogType(dialog);

    if (currentDialog !== DIALOG_TYPE.PAGE_SETTINGS) {
      return;
    }

    // TODO: Inject react component to be used to show the uploaded files
    dialog.params.tabs.push({
      name: "uploads",
      tabTitle: "Uploads",
      reactData: {
        component: () => <span id="uploadApp" />,
        props: {
          getData: () => ({
            isDirty: false,
          }),
        },
      },
      tabFields: [],
      tabPanelObj: {},
    });

    // Render after upload tab is chosen
    Y.Global.after("EditingDialog:tab-shown", (e) => {
      if (e.name === "uploads") {
        const pageUrl = dialog.params.initialData.fullUrl.replace(/^\//, "");
        setTimeout(() => {
          if (Uploads) {
            render(
              <Uploads pageUrl={pageUrl} />,
              window.top.document.querySelector("#uploadApp")
            );
          } else {
            console.warn("Should render Upload dialog content");
          }
        });
      }
    });
  }
}

// Sets up event listener to show upload field in correct dialogs
function initDialog() {
  injectStyleSheet();
  Y.Global.before("EditingDialog:show", uploadDialogInit);
  Y.Global.after("EditingDialog:show", dialogInit);
}

export { dialogInit, initDialog, uploadDialogInit };
