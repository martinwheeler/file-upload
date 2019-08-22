import "./fake-squarespace";
import { checkVersion, getDialogType, DIALOG_TYPE } from "./squarespace";

describe("checkVersion", () => {
  it("should not throw", () => {
    expect(checkVersion).not.toThrow();
  });

  it("should send slack message", () => {
    localStorage.setItem("squareSpaceVersion", "some-invalid-version");
    checkVersion();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("getDialogType", () => {
  it("should return an add dialog type", () => {
    const addDialog = {
      titleTextEl: {
        get: () => "Add Form Field"
      }
    };
    const actual = getDialogType(addDialog);
    const expected = DIALOG_TYPE.ADD;
    expect(actual).toEqual(expected);
  });

  it("should return an edit dialog type", () => {
    const addDialog = {
      titleTextEl: {
        get: () => "Edit Form"
      }
    };
    const actual = getDialogType(addDialog);
    const expected = DIALOG_TYPE.EDIT;
    expect(actual).toEqual(expected);
  });
});
