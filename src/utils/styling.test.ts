import "./fake-squarespace";

import { getFormElements, checkForms } from "./styling";

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

  describe("getFormElements", () => {
    it("should return 1 form input elements", () => {
      const actual = getFormElements().length;
      const expected = 1;
      expect(actual).toEqual(expected);
    });
  });
});
