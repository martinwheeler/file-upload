/* tslint:disable */
import "@babel/polyfill";

import React from "react";
import { render } from "react-dom";
import invariant from "invariant";

import { getFormElements, checkForms } from "./utils/styling";
import { version } from "../package.json";
import { bugsnagClient } from "./utils/bugsnag";

import developmentGlobals from "./utils/development-globals";
import get from "lodash/get";

declare global {
  interface Window {
    Squarespace: any;
    MutationObserver: any;
  }
}

declare const process: any;
declare const Y: any;

const {
  Squarespace,
  self: currentWindow,
  top: topWindow,
  MutationObserver
} = window;
const validBrowser = !!MutationObserver;

try {
  invariant(
    !!Squarespace ||
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "development",
    "🛑 You are not allowed to run this script anywhere other than Squarespace."
  );

  let domObserver = null;
  let hasBeenInitialised = false;
  let FormUploaderModule = null;
  let hasInitOtherTabListener = null;
  let hasCreatedAdminDialog = false;
  let resetAdminDialog = null;

  const checkFormUploaderModule = async () => {
    try {
      if (!FormUploaderModule) {
        FormUploaderModule = await import("./form-uploader");
      }
    } catch (error) {
      bugsnagClient.notify(error);
      if (process.env.NODE_ENV !== "test" && developmentGlobals.autoReload) {
        topWindow.location.reload(true);
      }
    }

    return FormUploaderModule.default;
  };

  const detectShowingOriginalTab = (
    newDialogRoot,
    bodyContainerNode,
    uploadLabelNode
  ) => event => {
    hasInitOtherTabListener = true;
    if (!newDialogRoot.contains(event.target)) {
      // TODO: Check if the user has clicked a different link in the nav
      const isAnotherTab = Array.prototype.slice
        .call(event.target.classList)
        .some(
          className =>
            className.includes("NavItem-container-") ||
            className.includes("NavText-container-") ||
            className.includes("NavText-subtitle-") ||
            className.includes("Text-container-") ||
            className.includes("Text-subtitle-")
        );

      if (isAnotherTab) {
        // TODO: Remove active style to upload label
        uploadLabelNode.classList.remove("is-active");
        bodyContainerNode.style.display = "flex";
        newDialogRoot.style.display = "none";
      }
    }
  };

  Squarespace &&
    Squarespace.onInitialize(Y, async () => {
      console.warn(`🚀 INITIALISING FORM UPLOADER: v${version}`);

      if (!validBrowser || developmentGlobals.invalidBrowser) {
        // TODO: Lazy load Bowser + notify util
        const BowserUtil = import("bowser").then(Imported => {
          const Bowser = Imported.default;
          const browserDetails = Bowser.parse(topWindow.navigator.userAgent);
          const shortBrowserDetails = `${browserDetails.os.name}: ${browserDetails.browser.name} - ${browserDetails.browser.version}`;
          const currentUrl = topWindow.location.href;

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
                    short: false
                  }
                ]
              }
            ]
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
          domObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === "childList") {
                const hasForm = !!mutation.target.querySelector("form");

                if (hasForm) {
                  const forms = checkForms(getFormElements());
                  if (forms.length) {
                    checkFormUploaderModule().then(FormUploader => {
                      forms.forEach(form =>
                        form.forEach(fileInput => new FormUploader(fileInput))
                      );
                    });
                  }
                }

                const closingAdminDialog =
                  Array.prototype.slice
                    .call(get(mutation, "previousSibling.classList") || [])
                    .some(className => className.includes("CCModalPortal")) &&
                  hasCreatedAdminDialog;

                if (closingAdminDialog) {
                  resetAdminDialog();
                }

                const hasAdminDialog =
                  (mutation.addedNodes[0] &&
                    mutation.addedNodes[0].dataset &&
                    mutation.addedNodes[0].dataset.modalId) ||
                  Array.prototype.slice
                    .call(mutation.target.classList)
                    .some(className => className.includes("Body-container-"));

                if (hasAdminDialog && !hasCreatedAdminDialog) {
                  hasCreatedAdminDialog = true;
                  const navDialogContainer = topWindow.document.querySelector(
                    "div[class*='NavDialog-container-']"
                  );
                  const navMenuElement = topWindow.document.querySelector(
                    "div[class^='NavMenu-container']"
                  );
                  const bodyContainer = navDialogContainer.querySelector(
                    "div[class^='Body-container-']"
                  );
                  const closeButton = navDialogContainer.querySelector(
                    "button"
                  );

                  if (developmentGlobals.debugMode) {
                    console.warn("PAGE ELEMENTS: ", {
                      navDialogContainer,
                      navMenuElement,
                      bodyContainer,
                      closeButton
                    });
                  }

                  const newDialogRoot = topWindow.document.createElement("div");
                  newDialogRoot.setAttribute("id", "newUploadDialogApp");
                  newDialogRoot.style.position = "relative";
                  newDialogRoot.style.flex = "1";
                  newDialogRoot.style.display = "block";
                  newDialogRoot.style.padding = "85px 33px 55px 55px";

                  let unSubHandler = null;

                  topWindow.showNewUploadSection = element => {
                    const pageUrl = topWindow.document.querySelector(
                      'input[title="URL Slug"]'
                    ).value;
                    const possibleDialogRoot = topWindow.document.querySelector(
                      "#newUploadDialogApp"
                    );

                    element.classList.add("is-active");

                    bodyContainer.style.display = "none";
                    if (!possibleDialogRoot) {
                      navDialogContainer.appendChild(newDialogRoot);

                      // TODO: Lazy load the upload component
                      const UploadsComponent = import(
                        "./components/uploads"
                      ).then(Component => {
                        const Uploads = Component.default;
                        render(
                          <Uploads newDialog pageUrl={pageUrl} />,
                          topWindow.document.querySelector(
                            "#newUploadDialogApp"
                          )
                        );
                      });

                      // NOTE: Make sure we show old body when user navigates away from uploads section
                    } else {
                      // Reshow the body element
                      possibleDialogRoot.style.display = "block";
                    }

                    if (!hasInitOtherTabListener) {
                      const handler = detectShowingOriginalTab(
                        newDialogRoot,
                        bodyContainer,
                        element
                      );

                      topWindow.document.body.addEventListener(
                        "click",
                        handler
                      );

                      unSubHandler = () => {
                        topWindow.document.body.removeEventListener(
                          "click",
                          handler
                        );
                      };
                    }

                    /**
                     * Remove the isActive class from any other nav labels, as we are showing it on
                     * the Uploads label now.
                     */
                    topWindow.document
                      .querySelectorAll("div[class^=NavTextMarker-bar-]")
                      .forEach(element => {
                        element.classList.forEach(className => {
                          if (className.includes("isActive")) {
                            element.classList.remove(className);
                          }
                        });
                      });
                  };

                  const newNavItem = topWindow.document.createElement("div");
                  newNavItem.setAttribute("id", "dialogUploadApp");
                  newNavItem.innerHTML =
                    "<span class='new-form-upload-label' onclick='window.top.showNewUploadSection(this)'>Uploads</span>";
                  navMenuElement.appendChild(newNavItem);

                  resetAdminDialog = () => {
                    newNavItem.remove();
                    newDialogRoot.remove();
                    if (unSubHandler) {
                      unSubHandler();
                    }
                    hasInitOtherTabListener = false;
                    hasCreatedAdminDialog = false;
                  };
                  closeButton.addEventListener("click", resetAdminDialog);
                }
              }
            });
          });

          domObserver.observe(topWindow.document, {
            attributes: true,
            childList: true,
            subtree: true
          });
        }
      }

      /**
       * Checks to see if we are in editing mode and adds the correct upload fields.
       */
      if (
        currentWindow !== topWindow &&
        topWindow.document.querySelector("html.squarespace-damask")
      ) {
        let AdminUploadField = {
          initDialog: () => {
            if (
              process.env.NODE_ENV !== "test" &&
              developmentGlobals.autoReload
            ) {
              topWindow.location.reload(true);
            }
          }
        };

        try {
          AdminUploadField = await import("./admin-upload-field");
        } catch (error) {
          bugsnagClient.notify(error);
        }

        console.warn("ADMIN UPLOAD: ", AdminUploadField);

        AdminUploadField.initDialog();
      }

      if (!hasBeenInitialised) {
        hasBeenInitialised = true;

        const forms = checkForms(getFormElements());
        if (forms.length) {
          checkFormUploaderModule().then(FormUploader => {
            forms.forEach(form =>
              form.forEach(fileInput => new FormUploader(fileInput))
            );
          });
        }
      }
    });
} catch (error) {
  bugsnagClient.notify(error);
}
