import "./utils/fake-squarespace-admin";
import {
  UPLOAD_FIELD_CONFIG,
  initDialog,
  dialogInit
} from "./admin-upload-field";

describe("AdminUploadField", () => {
  describe("initDialog", () => {
    it("injects a stylesheet with ID of formUploaderStyles", () => {
      initDialog();
      // TODO Test head for stylesheet element with src attribute
      const headElement = document.querySelector("head");
      const stylesheetElement = document.querySelector("#formUploaderStyles");
      const actual = headElement.contains(stylesheetElement);
      expect(actual).toBeTruthy();
    });
  });
  describe("dialogInit", () => {
    const addClass = jest.fn();
    const unshift = jest.fn();
    const set = jest.fn();

    it("modifies the edit input with a classname", () => {
      const fakeAddFormElement = {
        currentTarget: {
          onceAfter: (eventName, callback) => {
            callback();
          },
          titleTextEl: {
            get: () => "Edit Form"
          },
          getField: () => {
            return {
              after: (evetnName, callback) => {
                callback();
              },
              get: () => ({
                all: () => ({
                  each: callback => {
                    callback({
                      one: () => {
                        return {
                          get: () => {
                            return {
                              indexOf: () => 0
                            };
                          }
                        };
                      },
                      addClass: addClass
                    });
                  }
                })
              })
            };
          }
        }
      };
      dialogInit(fakeAddFormElement);
      expect(addClass).toHaveBeenCalledTimes(1);
      expect(addClass).toHaveBeenCalledWith("icon-file");
    });

    it("creates the add dialog element", () => {
      const otherFields = {
        icon: "text-area"
      };
      const fakeEditFormElement = {
        currentTarget: {
          onceAfter: (eventName, callback) => {
            callback();
          },
          titleTextEl: {
            get: () => "Add Form Field"
          },
          fields: {
            fieldOptions: {
              get: () => {
                return [otherFields];
              },
              set: set
            }
          }
        }
      };
      dialogInit(fakeEditFormElement);
      expect(set).toHaveBeenCalledTimes(1);
      expect(set).toHaveBeenCalledWith("options", [
        UPLOAD_FIELD_CONFIG,
        otherFields
      ]);
    });
  });
});
