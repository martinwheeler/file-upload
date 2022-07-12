import "@babel/polyfill";

import invariant from "invariant";

// import { allHTMLFormElements, getFormsWithUploadInputs } from "~/utils/styling";
import { version } from "../package.json";
// import { bugsnagClient } from "~/utils/bugsnag";

import developmentGlobals from "~/utils/development-globals";
import { Y } from "~/types/global/Y";
import { Squarespace } from "~/types/global/Squarespace";
import { createUploadElement, findMenuElement } from "~/utils/admin";
import { toArray } from "lodash";

declare global {
  interface Window {
    Squarespace: Squarespace;
    Y: Y;
  }
}

declare const process: any;

const { self: currentWindow, top: topWindow, MutationObserver } = window;
const validBrowser = !!MutationObserver;

try {
  // invariant(
  //   !Boolean(window.Squarespace) ||
  //     process.env.NODE_ENV === "test" ||
  //     process.env.NODE_ENV === "development",
  //   "🛑 You are not allowed to run this script anywhere other than Squarespace."
  // );

  let domObserver: MutationObserver | null = null;
  let FormUploaderModule: {
    default: any;
  } | null = null;
  let hasInitOtherTabListener: boolean | null = null;
  let hasCreatedAdminDialog = false;
  let resetAdminDialog: (() => void) | null = null;

  // const checkFormUploaderModule = async () => {
  //   try {
  //     if (!FormUploaderModule) {
  //       FormUploaderModule = await import("./form-uploader");
  //       return FormUploaderModule.default;
  //     }
  //   } catch (error) {
  //     bugsnagClient.notify(error);
  //     if (process.env.NODE_ENV !== "test" && developmentGlobals.autoReload) {
  //       topWindow!.location.reload();
  //     }
  //   }
  // };

  // /**
  //  * Handles updating any form input which has the required attributes to be a file upload input.
  //  */
  // const modifyUploadFields = () => {
  //   const forms = getFormsWithUploadInputs(allHTMLFormElements());
  //   if (forms.length) {
  //     checkFormUploaderModule().then((FormUploader) => {
  //       forms.forEach((form: any) =>
  //         form.forEach(
  //           (fileUploadInput: any) => new FormUploader(fileUploadInput)
  //         )
  //       );
  //     });
  //   }
  // };

  const addAdminDialog = (container: Node) => {
    // const startElement = contains("p", "Page Settings");

    /**
     * New upload admin dialog hijacking
     */
    if (container && !hasCreatedAdminDialog) {
      const menuElement = findMenuElement(container as HTMLElement);
      if (menuElement) {
        createUploadElement(menuElement);
      }
    }
  };

  const removeAdminDialog = (container: Node) => {};

  /**
   * 1. Checks if we are running on a valid browser, which has a MutationObserver defined & we don't have the debug variable set to true
   *   a. Get the browser name using bowser & send a slack notification
   * 2. Create a new MutationObserver and make sure when the dom changes that we are still showing the upload fields & admin form changes
   *   a. Look for any form elements & then modify them using modifyUploadFields()
   *   b. Handle removing the admin dialog changes from the page & any event listeners
   *   c. Handles adding a new upload section to the admin dialog
   * 3. Attach the dom observer to the top window
   * 4. Modify the upload fields after initialisation
   * 5. Modify the admin dialog after initialisation
   */
  window.Squarespace &&
    window.Squarespace.onInitialize(window.Y, async () => {
      console.warn(`🚀 INITIALISING FORM UPLOADER: v${version}`);

      if (!validBrowser || developmentGlobals.invalidBrowser) {
        import("bowser").then((Imported) => {
          const Bowser = Imported.default;
          const browserDetails = Bowser.parse(
            topWindow!.navigator?.userAgent || ""
          );
          const shortBrowserDetails = `${browserDetails.os.name}: ${browserDetails.browser.name} - ${browserDetails.browser.version}`;
          const currentUrl = topWindow!.location.href;

          const invalidBrowserMessage = {
            username: "File Uploader",
            attachments: [
              {
                fallback: `An invalid browser version has been used! They won't be able to see the upload input on new DOM nodes. On: ${shortBrowserDetails}`,
                pretext: `An invalid browser has been detected! ${currentUrl}`,
                color: "#D00000",
                fields: [
                  {
                    title: "Browser",
                    value: JSON.stringify(browserDetails, null, 2),
                    short: false,
                  },
                ],
              },
            ],
          };

          import("./utils/slack").then(({ notify }) => {
            notify(invalidBrowserMessage);
          });
        });
      } else {
        if (!domObserver) {
          /**
           * Creates a DOM mutation observer to run check forms encase a new
           * upload field has been created by the user.
           */
          domObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (mutation.type === "childList") {
                const addedNodes = toArray(mutation.addedNodes);
                const removedNodes = toArray(mutation.removedNodes);

                if (addedNodes.length) {
                  // TODO: Add the DOM changes
                  const adminModalContainer = addedNodes.find((node: any) => {
                    return node?.innerText?.includes("Page Settings");
                  });

                  if (adminModalContainer) {
                    console.debug("📝 Admin modal found - adding");
                    addAdminDialog(adminModalContainer);
                  }
                }

                if (removedNodes.length) {
                  // TODO: Remove the DOM changes
                  const adminModalContainer = removedNodes.find((node: any) => {
                    return node?.innerText?.includes("Page Settings");
                  });

                  if (adminModalContainer) {
                    console.debug("📝 Admin modal found - removing");
                    removeAdminDialog(adminModalContainer);
                  }
                }

                // const hasForm = !!(
                //   mutation.target as HTMLElement
                // ).querySelector("form");

                // if (hasForm) {
                //   modifyUploadFields();
                // }
              }
            });
          });

          domObserver.observe(topWindow!.document, {
            attributes: true,
            childList: true,
            subtree: true,
          });

          // modifyUploadFields(); // Modify upload fields on first initialisation/page load
        }
      }

      /**
       * Checks to see if we are in editing mode and adds the correct upload fields.
       */
      // if (currentWindow !== topWindow || developmentGlobals.adminArea) {
      //   let AdminUploadField = {
      //     initDialog: () => {
      //       if (
      //         process.env.NODE_ENV !== "test" &&
      //         developmentGlobals.autoReload
      //       ) {
      //         topWindow!.location.reload();
      //       }
      //     },
      //   };

      //   try {
      //     AdminUploadField = await import("./admin-upload-field");
      //   } catch (error) {
      //     bugsnagClient.notify(error);
      //   }

      //   console.warn("ADMIN UPLOAD: ", AdminUploadField);

      //   AdminUploadField.initDialog();
      // }
    });
} catch (error) {
  console.error(error);
}
