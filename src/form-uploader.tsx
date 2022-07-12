import SAU, { SimpleUpload } from "../vendor/simple-ajax-uploader";
import { injectStyleSheet } from "./utils/styling";
import { USER_ID } from "./utils/squarespace";
import validatorjs from "validatorjs";
import get from "lodash/get";
import { StringObject } from "types/StringObject";

const UPLOAD_URL = `${process.env.API_BASE_URL}/v2/upload`;

class FormUploader {
  fileInput: HTMLInputElement;
  hasShownError: boolean;
  requirements: { field: string; message: string };
  currentUploader: SimpleUpload | undefined;
  folderName: string;
  pagePath: any;
  folderBaseName: string;

  constructor(fileInput: HTMLInputElement) {
    injectStyleSheet();

    this.hasShownError = false;
    this.requirements = {
      field: "Label name",
      message: "Please enter your label name before uploading your collection.",
    };
    this.fileInput = fileInput;

    this.buildUploader = this.buildUploader.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.resetErrorStyles = this.resetErrorStyles.bind(this);

    this.currentUploader = this.buildUploader();
    this.folderName = "";
    this.pagePath = (
      process.env.NODE_ENV === "test"
        ? "/my-upload-page"
        : get(window, "top.location.pathname")
    ).replace(/^\//, "");
    this.folderBaseName = `${USER_ID}/${this.pagePath}`;
  }

  resetErrorStyles({ inputNode, parentNode, hasAddedParentClass }: any) {
    const currentClasses = inputNode.className;
    inputNode.className = currentClasses.replace(" field-validation-error", "");
    if (hasAddedParentClass) {
      const currentParentClasses = parentNode.className;
      parentNode.className = currentParentClasses.replace(
        " field-validation-error-message",
        ""
      );
    }
  }

  handleValidation(event: any) {
    const { requirements } = this;

    const labels = Array.prototype.slice.call(
      document.querySelectorAll("form label")
    );

    const data: StringObject = {};
    const rules: StringObject = {};
    const fields: StringObject = {};

    labels.forEach((label) => {
      const currentLabelText = label.innerHTML
        .replace(/\<.*\>/, "")
        .trim()
        .toLowerCase();

      if (currentLabelText === requirements.field.toLowerCase()) {
        const currentFor = label.getAttribute("for");
        const inputId = `#${currentFor}`;
        const input =
          !!currentFor && (document.querySelector(inputId) as HTMLInputElement);
        const validationKey = currentLabelText.replace(/\s/g, "_");

        if (!!input) {
          data[validationKey] = input.value;
          this.folderName = input.value;
          rules[validationKey] = "required";
          fields[validationKey] = {
            forAttribute: currentFor,
            inputId,
            inputField: input,
          };
        }
      }
    });

    const validator = new validatorjs(data, rules);

    if (!validator.passes()) {
      const errors = validator.errors.all();
      let currentForm: HTMLFormElement;

      Object.keys(errors).forEach((error) => {
        const parentNode = fields[error].inputField.parentNode;
        const inputNode = fields[error].inputField;
        let hasAddedParentClass = false;

        currentForm = inputNode.form;

        if (
          !parentNode.className.includes("field-validation-error-message") &&
          parentNode.tagName === "DIV"
        ) {
          hasAddedParentClass = true;
          parentNode.setAttribute("data-error-message", errors[error]);
          parentNode.className += " field-validation-error-message";
        }

        if (
          !inputNode.className.includes("field-validation-error") &&
          inputNode.tagName === "INPUT"
        ) {
          inputNode.addEventListener("change", () =>
            this.resetErrorStyles({
              inputNode,
              parentNode,
              hasAddedParentClass,
            })
          );
          inputNode.className += " field-validation-error";
        }
      });

      event.stopPropagation();
      event.preventDefault();

      // Scroll up the form so users can see validation errors
      // @ts-ignore
      if (currentForm && currentForm.scrollIntoView) {
        currentForm.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }

      return;
    }
  }

  /**
   * Creates the actual upload instance to be used when a user uploads
   * some files.
   */
  buildUploader() {
    const { fileInput } = this;
    const error = new Error();
    // NOTE: We only want to run the build over fields that have not been modified yet
    const validFileInput = !fileInput.className.includes("sqsf-uploader");

    if (!validFileInput) {
      error.message = "Invalid File Input Field";
      return;
    }

    let textInput: HTMLInputElement | null =
      fileInput.querySelector(".field-element");

    if (!textInput) {
      error.message = "Invalid Text Input Field";
      return;
    }

    // Get placeholder
    const placeholderElement = textInput.getAttribute("placeholder");
    const allowedExtensions = (placeholderElement &&
      placeholderElement.replace(/\s/g, "").split(",")) || [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".txt",
    ];

    // Get description
    const descriptionElement: HTMLElement | null =
      fileInput.querySelector(".description");
    const descriptionValue = descriptionElement!.textContent!.replace(
      /\s/g,
      ""
    );

    const fileInputId = fileInput.getAttribute("id");

    if (fileInput.querySelector(".description")) {
      (fileInput!.querySelector(
        ".description"
      ) as HTMLElement)!.style!.display = "none";
    }

    if (textInput) {
      textInput.style.display = "none";
    }

    if (textInput && textInput.tagName !== "TEXTAREA") {
      textInput.style.display = "none";

      const replacementInput = document.createElement("textarea");
      replacementInput.id = textInput.id;
      replacementInput.style.display = "none";
      replacementInput.className = textInput.className;
      replacementInput.value = textInput.value.replace(/   /g, "   \n");
      fileInput.removeChild(textInput);
      fileInput.appendChild(replacementInput);
    }

    const uploadProgressUrl = null;

    const defaultConfigOptions = {
      Multiple: false,
      MaxSize: 10480,
      ButtonLabel: "Add_Your_Files",
      RequiredField: "Label_Name",
      RequiredFieldMessage:
        "Enter_the_name_of_your_Label_before_uploading_your_Collection.",
    };

    const configOptions = descriptionValue
      .replace(/\s/g, "")
      .split(";")
      .reduce((result, currentOption) => {
        const keyValuePair = currentOption.split("=");

        return {
          ...result,
          [keyValuePair[0]]:
            (keyValuePair[1] && keyValuePair[1].replace(/_/g, " ")) || true,
        };
      }, defaultConfigOptions);

    const {
      ButtonLabel: buttonLabel,
      Multiple: isMultiple,
      MaxSize: maxSize,
      RequiredField: requiredField,
      RequiredFieldMessage: requiredMessage,
    } = configOptions;

    this.requirements = {
      field: requiredField.replace(/_/g, " "),
      message: requiredMessage.replace(/_/g, " "),
    };

    const fileInputNode = fileInput.querySelector(".fileInput");
    if (fileInputNode) {
      while (fileInputNode.firstChild) {
        fileInputNode.removeChild(fileInputNode.firstChild);
      }
      fileInput.removeChild(fileInputNode);
    }

    const inside = document.createElement("div");
    inside.innerHTML = `<div style="margin-right: 15px;" class="uploadButton button sqs-system-button sqs-editable-button">
            ${buttonLabel}
            </div>
            <div class="progressBox"></div>
            <div class="messageBox"></div>`;
    inside.className = "fileInput field-element clear";
    fileInput.appendChild(inside);

    // TODO: Move error to above innerHTML
    const errorBox = document.createElement("div");
    errorBox.className = "field-error";

    const messageBox = fileInput.querySelectorAll(".messageBox")[0];

    /**
     * Creates a dynamic folder property so that when the upload
     * is triggered it fetches what the user has entered into the
     * label field.
     */
    const extraFormData = new Proxy(
      {
        folder: null,
      },
      {
        get: (value, key) => {
          if (key === "folder") {
            // TODO: Get the form name or the button label and use that as a default
            return `${this.folderBaseName}/${this.folderName || "default"}`;
          }
          return Reflect.get(value, key);
        },
      }
    );

    fileInput.className = fileInput.className + " sqsf-uploader";

    if (textInput.value) {
      var urls_added = textInput.value.split("   \n").length;
      var z = urls_added > 1 ? "s" : "";
      var success = document.createElement("div");
      success.className = "upload-success";
      success.innerHTML =
        '<div class="name" style="margin:10px 10px 10px 0;color: green;">' +
        urls_added +
        " <span>file" +
        z +
        " already added.</span></div>";
      messageBox.appendChild(success);
    }

    /**
     * Create the file uploader.
     */
    const uploader = new SAU.SimpleUpload({
      customHeaders: {
        "User-Id": USER_ID,
      },
      id: fileInputId,
      accept: allowedExtensions.toString(),
      multipart: true,
      multiple: isMultiple,
      multipleSelect: isMultiple,
      button: fileInput.querySelector(".uploadButton"),
      dropzone: fileInput.querySelector(".uploadButton"),
      url: UPLOAD_URL,
      name: "file",
      data: extraFormData,
      sessionProgressUrl: uploadProgressUrl,
      responseType: "json",
      allowedExtensions: allowedExtensions.map((allowedExtension) => {
        return allowedExtension.replace(/\./g, "").replace(/\s/g, "");
      }),
      maxSize: +maxSize, // kilobytes
      hoverClass: "ui-state-hover",
      focusClass: "ui-state-focus",
      disabledClass: "ui-state-disabled",
      onChange: () => {
        fileInput.querySelector(".field-error") &&
          fileInput.removeChild(
            fileInput.querySelector(".field-error") as Node
          );
      },
      onExtError: (fileName: any, ext: any) => {
        const errorMessage = `Your file ${fileName} is ${ext} type. We accept only these files ${allowedExtensions}`;

        errorBox.innerHTML = errorMessage;
        fileInput.insertBefore(errorBox, fileInput.querySelector(".title"));
      },
      onSizeError: (fileName: any, fileSize: any) => {
        const errorMessage = `Your file ${fileName} is to large! You need to compress the image or resize it, so it's smaller.`;
        fileInput.insertBefore(errorBox, fileInput.querySelector(".title"));
      },
      onBlankSubmit: function (event: any) {
        console.warn("EMPTY SUBMIT: ", event);
      },
      onSubmit: function (
        fileName: any,
        extension: any,
        i: any,
        fileSize: any
      ) {
        fileInput.querySelector(".field-error") &&
          fileInput.removeChild(
            fileInput.querySelector(".field-error") as Node
          );

        let progress = document.createElement("div");
        progress.className = "progress";
        progress.style = "width:100%; height: 4px; margin: 5px 0;";

        let bar = document.createElement("div");
        bar.className = "progress-bar";
        bar.style =
          "background: #a5a5a5; height: 100%; transition: width 1s 0.1s ease;";
        progress.appendChild(bar);

        let wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.innerHTML =
          '<div class="name" style="margin:10px 10px 10px 0">' +
          fileName +
          " <span> - " +
          fileSize +
          "KB</span></div>";
        wrapper.appendChild(progress);

        let progressBox = fileInput.querySelector(".progressBox");
        progressBox.appendChild(wrapper);

        if (!isMultiple) {
          const wrappers = Array.prototype.slice.call(
            fileInput.querySelectorAll(".wrapper")
          );
          wrappers.forEach(function (wrap) {
            wrap.parentNode.removeChild(wrap);
          });
        }

        this && this.setProgressBar && this.setProgressBar(bar);
        this && this.setProgressContainer && this.setProgressContainer(wrapper);
      },
      onComplete: function (fileName, response) {
        if (!response) {
          errorBox.textContent = `${fileName} upload failed`;
          fileInput.insertBefore(errorBox, fileInput.querySelector(".title"));
          return;
        } else {
          if (response.success && response.urls.length) {
            const allUrls = response.urls.reduce((result, currentUrl) => {
              return `${result}\n${currentUrl}`;
            }, "");

            textInput.value = `${textInput.value}${allUrls}`;

            var success = document.createElement("div");
            success.className = "upload-success";
            success.innerHTML = `<div class="name" style="margin:10px 10px 10px 0;color: green;">${fileName}</div>`;
            messageBox.appendChild(success);
          }
        }
      },
    });

    const uploadInput = document.querySelector("input[type=file][name=file]");
    uploadInput.addEventListener("click", this.handleValidation);

    return uploader;
  }
}

export default FormUploader;
