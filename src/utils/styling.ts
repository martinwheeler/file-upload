/**
 * Injects a stylesheet to the head of the page if the style element
 * with the matching id doesn't already exist.
 *
 * @param {*} file
 * @param {*} node
 * @param {*} id
 */
function injectStyleSheet(id = "formUploaderStyles") {
  const headElement = window.top.document.getElementsByTagName("head")[0];
  if (!headElement || headElement.querySelector(`#${id}`)) {
    return false;
  }

  const newStyleSheet = document.createElement("style");
  newStyleSheet.innerHTML = `
    .option.icon-file {
      background-image: url("https://image.flaticon.com/icons/svg/126/126494.svg");
      background-size: 32px;
    }
    
    .sqs-form-builder-field.icon-file
      .sqs-form-builder-field-content
      .field-type-icon {
      background-image: url("https://image.flaticon.com/icons/svg/126/126494.svg");
    }
    
    .form-wrapper .field-list .field .field-element.field-validation-error {
      border: 1px solid red;
    }
    
    .field-validation-error-message::after {
      content: attr(data-error-message);
      color: #e30000;
    }
    
    .new-form-upload-label {
      margin: 8px 0;
      font-size: 15px;
      font-weight: 500;
      line-height: 20px;
      color: #313131;
      position: relative;
      display: block;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
    }
    
    .new-form-upload-label:after {
      content: "";
      border-top-width: 2px;
      width: 59.45px;
      border-top-style: solid;
      position: absolute;
      left: 0;
      bottom: -3px;
      transform-origin: left;
      transition-property: transform;
      transition-duration: 0.5s;
      transition-timing-function: cubic-bezier(0.4, 0, 0.68, 0.06);
      transform: scaleX(0);
    }
    
    .new-form-upload-label:hover:after {
      transition-timing-function: cubic-bezier(0.32, 0.94, 0.6, 1);
      transform: scaleX(1);
    }
    
    .new-form-upload-label.is-active:after {
      transition-timing-function: cubic-bezier(0.32, 0.94, 0.6, 1);
      transform: scaleX(1);
    }
  `;
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
