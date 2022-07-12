import "./fake-squarespace";

import { allHTMLFormElements, getFormsWithUploadInputs } from "./styling";

describe("undress plugins", () => {
  describe("getFormsWithUploadInputs", () => {
    it("should return an empty array", () => {
      expect(getFormsWithUploadInputs()).toEqual([]);
    });
    it("should return 1 form elements", () => {
      const availableForms = Array.prototype.slice.call(
        document.querySelectorAll(".form-wrapper:not(.hidden)")
      );
      const actual = getFormsWithUploadInputs(availableForms).length;
      const expected = 1;

      expect(actual).toEqual(expected);
    });
  });

  describe("allHTMLFormElements", () => {
    it("should return 1 form input elements", () => {
      const actual = allHTMLFormElements().length;
      const expected = 1;
      expect(actual).toEqual(expected);
    });
  });
});
