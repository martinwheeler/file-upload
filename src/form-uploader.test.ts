import "./utils/fake-squarespace";
import FormUploader from "./form-uploader";
import { checkForms, getFormElements } from "./utils/styling";

let Uploaders = [];
const forms = checkForms(getFormElements());
if (forms.length) {
  forms.forEach(form =>
    form.forEach(fileInput => {
      Uploaders.push(new FormUploader(fileInput));
    })
  );
}

// NOTE: First form is valid from the fake squarespace markup
const MultipleUploader = Uploaders[0];
const SingleUploader = Uploaders[1];

describe("FormUploader", () => {
  it("should exist", () => {
    expect(MultipleUploader).toBeDefined();
  });

  it("should return a test upload preset", () => {
    expect(MultipleUploader.currentUploader._opts.data.upload_preset).toEqual(
      "test"
    );
  });

  it("should return a matching folder name", () => {
    document.querySelector(
      "#text-yui_3_17_2_1_1429836440180_49187-field"
    ).value = "My Label";

    MultipleUploader.handleValidation({
      stopPropagation: jest.fn,
      preventDefault: jest.fn
    });

    expect(MultipleUploader.currentUploader._opts.data.folder).toEqual(
      "test-environment-2387443bj4ggggg7834/my-upload-page/My Label"
    );

    document.querySelector(
      "#text-yui_3_17_2_1_1429836440180_49187-field"
    ).value = "";
  });

  describe("handleValidation", () => {
    it("should pass validation", () => {
      const fakeEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn()
      };
      MultipleUploader.handleValidation(fakeEvent);
    });
  });

  describe("resetErrorStyles", () => {
    it("should not fail", () => {
      // Assuming we're listening for e.g. a 'change' event on `element`

      // Create a new 'change' event
      var event = new Event("change");
      const element = document.querySelector(
        "#text-yui_3_17_2_1_1429836440180_49187-field"
      );

      // Dispatch it.
      element.dispatchEvent(event);

      MultipleUploader.resetErrorStyles({
        inputNode: {
          className: ""
        },
        parentNode: false,
        hasAddedParentClass: false
      });

      MultipleUploader.resetErrorStyles({
        inputNode: {
          className: ""
        },
        parentNode: {
          className: ""
        },
        hasAddedParentClass: true
      });
    });
  });

  describe("onChange", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onChange();
    });
  });

  describe("onSizeError", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onSizeError("file", ".jpg");
    });
  });

  describe("onBlankSubmit", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onBlankSubmit("event");
    });
  });

  describe("onSubmit", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onSubmit("file", ".jpg", 0, 25);
      SingleUploader.currentUploader._opts.onSubmit("file", ".jpg", 0, 25);
    });
  });

  describe("onExtError", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onExtError("file", ".jpg");
    });
  });

  describe("onComplete", () => {
    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onComplete("file", {
        bytes: 25,
        type: "upload",
        signature: "signature_here"
      });
      MultipleUploader.currentUploader._opts.onComplete("file", {
        bytes: 0,
        type: "upload",
        signature: "signature_here"
      });
    });

    it("should not fail", () => {
      MultipleUploader.currentUploader._opts.onComplete("file", null);
    });
  });

  it("should show error message when required input is empty", () => {
    document.querySelector("input[type=file][name=file]").click();
    // TODO: Test the error classes appear
  });
});
