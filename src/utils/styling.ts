/**
 * Injects a stylesheet to the head of the page if the style element
 * with the matching id doesn't already exist.
 *
 * @param {*} file
 * @param {*} node
 * @param {*} id
 */
function injectStyleSheet(
  fileURL = "https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/src/styles.css",
  id = "formUploaderStyles"
) {
  const headElement = window.top.document.getElementsByTagName("head")[0];
  if (!headElement || headElement.querySelector(`#${id}`)) {
    return false;
  }

  const newStyleSheet = document.createElement("link");
  newStyleSheet.href = fileURL;
  newStyleSheet.rel = "stylesheet";
  newStyleSheet.id = id;

  headElement.appendChild(newStyleSheet);
  return true;
}

function getFormElements() {
  return Array.prototype.slice.call(document.querySelectorAll("form"));
}

function getFileUploadInputs(form) {
  return Array.prototype.slice
    .call(form.querySelectorAll(".form-item"))
    .filter(inputField => {
      const description = inputField.querySelector(".description");
      return description && description.textContent.includes("FileField");
    });
}

/**
 * Checks if the passed forms have valid file input fields.
 *
 * @param {*} forms
 */
function checkForms(forms) {
  if (!forms || !forms.length) {
    return [];
  }

  return forms
    .map(form => {
      const availableFileInputs = getFileUploadInputs(form);
      if (availableFileInputs.length) {
        return availableFileInputs;
      }
      return undefined;
    })
    .filter(Boolean);
}

export { injectStyleSheet, getFormElements, getFileUploadInputs, checkForms };
