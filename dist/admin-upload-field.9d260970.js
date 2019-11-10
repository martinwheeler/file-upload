// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"admin-upload-field.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dialogInit = dialogInit;
exports.initDialog = initDialog;
exports.uploadDialogInit = uploadDialogInit;
exports.UPLOAD_FIELD_CONFIG = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _styling = require("./utils/styling");

var _squarespace = require("./utils/squarespace");

var _bugsnag = require("./utils/bugsnag");

var _uploads = _interopRequireDefault(require("./components/uploads"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UPLOAD_FIELD_CONFIG = {
  icon: "file",
  title: "Upload Files",
  value: {
    description: "FileField;MaxSize=10240;Multiple;ButtonLabel=Add_Your_Files;RequiredField=Email;RequiredFieldMessage=Enter_your_email_before_uploading_your_files.",
    placeholder: ".jpg, .jpeg, .png, .gif, .txt",
    type: "textarea",
    title: "Upload Files",
    id: null,
    required: false,
    textarea: true
  }
};
/**
 * Handles injecting the custom upload field when adding a new field.
 * Also handles injecting the custom upload field when editing the
 * fields.
 *
 * @param {*} a
 */

exports.UPLOAD_FIELD_CONFIG = UPLOAD_FIELD_CONFIG;

function dialogInit(element) {
  var error = new Error();

  if (element && element.currentTarget) {
    var dialog = element.currentTarget;
    dialog.onceAfter("rendered", function () {
      var currentDialog = (0, _squarespace.getDialogType)(dialog);

      if (currentDialog === undefined) {
        error.message = "User could not detect which dialog opened.";

        _bugsnag.bugsnagClient.notify(error);
      } // Shows the field when adding a form field


      if (currentDialog === _squarespace.DIALOG_TYPE.ADD) {
        // Gets the form field options that will be shown
        var formFields = dialog.fields.fieldOptions;
        var options = formFields.get("options"); // Injects the upload file option at the top of the list

        if (options[0].icon !== "file") {
          options.unshift(UPLOAD_FIELD_CONFIG); // Updates the options the user will see

          formFields.set("options", options);
        }
      } // Shows the field when editing the form fields


      if (currentDialog === _squarespace.DIALOG_TYPE.EDIT) {
        var fields = dialog.getField("fields");
        fields.after("dataChange", function () {
          fields.get("contentBox").all(".sqs-form-builder-field").each(function (field) {
            if (field.one('textarea[placeholder="Description"]') && field.one('textarea[placeholder="Description"]').get("innerText").indexOf("FileField;") > -1) {
              field.addClass("icon-file");
            }
          });
        });
      }
    });
  }
}

function uploadDialogInit(element) {
  if (element && element.currentTarget) {
    var dialog = element.currentTarget;
    var currentDialog = (0, _squarespace.getDialogType)(dialog);

    if (currentDialog !== _squarespace.DIALOG_TYPE.PAGE_SETTINGS) {
      return;
    } // TODO: Inject react component to be used to show the uploaded files


    dialog.params.tabs.push({
      name: "uploads",
      tabTitle: "Uploads",
      reactData: {
        component: function component() {
          return _react.default.createElement("span", {
            id: "uploadApp"
          });
        },
        props: {
          getData: function getData() {
            return {
              isDirty: false
            };
          }
        }
      },
      tabFields: [],
      tabPanelObj: {}
    }); // Render after upload tab is chosen

    Y.Global.after("EditingDialog:tab-shown", function (e) {
      if (e.name === "uploads") {
        var pageUrl = dialog.params.initialData.fullUrl.replace(/^\//, "");
        setTimeout(function () {
          if (_uploads.default) {
            (0, _reactDom.render)(_react.default.createElement(_uploads.default, {
              pageUrl: pageUrl
            }), window.top.document.querySelector("#uploadApp"));
          } else {
            console.warn("Should render Upload dialog content");
          }
        });
      }
    });
  }
} // Sets up event listener to show upload field in correct dialogs


function initDialog() {
  (0, _styling.injectStyleSheet)();
  Y.Global.before("EditingDialog:show", uploadDialogInit);
  Y.Global.after("EditingDialog:show", dialogInit);
}
},{"react":"../node_modules/react/index.js","react-dom":"../node_modules/react-dom/index.js","./utils/styling":"utils/styling.ts","./utils/squarespace":"utils/squarespace.ts","./utils/bugsnag":"utils/bugsnag.ts","./components/uploads":"components/uploads.tsx"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "58405" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/admin-upload-field.9d260970.js.map