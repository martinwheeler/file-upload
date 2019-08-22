import "./fake-squarespace";

import { injectStyleSheet, getFormElements, checkForms } from "./styling";

describe("undress plugins", () => {
  describe("checkForms", () => {
    it("should return an empty array", () => {
      expect(checkForms()).toEqual([]);
    });
    it("should return 1 form elements", () => {
      const availableForms = Array.prototype.slice.call(
        document.querySelectorAll(".form-wrapper:not(.hidden)")
      );
      const actual = checkForms(availableForms).length;
      const expected = 1;

      expect(actual).toEqual(expected);
    });
  });

  describe("injectStyleSheet", () => {
    it("should inject a style element", () => {
      const actual = injectStyleSheet(
        "https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/styles.css",
        "testStylesheet"
      );
      expect(actual).toBeTruthy();
    });

    it("should not inject a style element with the same id more than once", () => {
      const actual = injectStyleSheet(
        "https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/styles.css",
        "testStylesheet"
      );
      expect(actual).toBeFalsy();
    });
  });

  describe("getFormElements", () => {
    it("should return 1 form input elements", () => {
      const actual = getFormElements().length;
      const expected = 1;
      expect(actual).toEqual(expected);
    });
  });
});
