let jest = global.jest;

const testEnv = process.env.NODE_ENV === "test";

window.Static = {
  SQUARESPACE_CONTEXT: {
    website: {
      identifier: "aqua-star-fwz2",
      id: "5d2e5bdfaaad3e0001c7ab23"
      // identifier: "edda-hamar-dpge",
      // id: "53d88f49e4b0d4d3dfedf6ed"
    }
  }
};

if (testEnv) {
  // Override the self property so it does not equal top
  Object.defineProperty(window, "self", {
    value: false
  });

  window.MutationObserver = class {
    constructor(callback) {
      // TODO: call with some fake mutation nodes
      callback([
        {
          type: "childList",
          addedNodes: [
            {
              className: ["form-wrapper"],
              querySelectorAll: () => {
                // Returns input fields
                // fileInput as referred to in the code base
                return [
                  {
                    className: "form-item field textarea required",
                    querySelector: tag => {
                      if (tag === ".field-element") {
                        // fileInput
                        return {
                          style: {
                            display: "block"
                          },
                          tagName: "",
                          id: "someTextInput",
                          className: "someMagicClass",
                          value: "",
                          getAttribute: () => {
                            return ".jpg";
                          }
                        };
                      }
                      if (tag === ".description") {
                        return {
                          textContent: "FileField;",
                          style: {
                            display: "block"
                          }
                        };
                      }
                    },
                    getAttribute: () => "someId",
                    removeChild: jest.fn(),
                    appendChild: jest.fn(),
                    querySelectorAll: jest.fn(() => {
                      return [
                        {
                          appendChild: jest.fn()
                        }
                      ];
                    })
                  }
                ];
              }
            }
          ]
        },
        {
          type: "notChildList"
        },
        {
          type: "childList",
          addedNodes: [
            {
              className: []
            }
          ]
        },
        {
          type: "childList",
          addedNodes: [
            {
              className: ["somethingElse"]
            }
          ]
        },
        {
          type: "childList",
          addedNodes: [
            {
              className: ["form-wrapper"],
              querySelectorAll: () => []
            }
          ]
        }
      ]);
    }
    observe(element, initObject) {}
  };

  window.fetch = jest.fn();

  window.console = {
    log: jest.fn(),
    warn: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    error: console.error
  };

  global.alert = jest.fn();

  window.Y = {
    Global: {
      after: jest.fn((eventName, callback) => {
        callback();
      }),
      before: jest.fn((eventName, callback) => {
        callback();
      })
    }
  };

  window.Squarespace = {
    initSubs: [],

    onInitialize: jest.fn((globalY, callback) => {
      window.Squarespace.initSubs.push(callback);
    })
  };
} else {
  window.Y = {};
  window.Squarespace = {
    initSubs: [],

    onInitialize: (globalY, callback) => {
      window.Squarespace.initSubs.push(callback);
    }
  };

  setTimeout(() => {
    console.warn("SUBS: ", window.Squarespace.initSubs);
    window.Squarespace.initSubs.forEach(sub => sub());
  }, 250);
}
