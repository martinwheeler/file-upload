const config = JSON.parse(localStorage.getItem("sqs-file-uploader")) || {};

/**
 * Toggles a flag that will be stored in LocalStorage. The flags are used within the plugin code to
 * enable or disable some features.
 *
 * Flags available are: debugMode, invalidBrowser, autoReload, adminArea
 */
window.top.toggleFlag = (flagName: string) => {
  localStorage.setItem(
    "sqs-file-uploader",
    JSON.stringify({ ...config, [flagName]: !config[flagName] })
  );
  window.top.location.reload(true); // Force refresh
};

window.top.debugEvents = () => {
  const allEvents = Object.keys(Y.Global._yuievt.events);
  const validEventName = RegExp(/[a-z]+:[a-z]+/, "i");
  allEvents
    .filter(eventName => {
      return validEventName.test(eventName);
    })
    .forEach(event => {
      Y.Global.before(event, e => {
        const groupName = `💥 BEFORE: ${event}`;
        console.group(groupName);
        console.log(`👉`, e);
        console.groupEnd(groupName);
      });
      Y.Global.after(event, e => {
        const groupName = `💥 FIRED: ${event}`;
        console.group(groupName);
        console.log(`👉`, e);
        console.groupEnd(groupName);
      });
    });
};

window.top.findUserData = target => {
  if (typeof target === "string") {
    console.warn("VALUE: ", target);
    return;
  }

  if (typeof target === "array") {
    target.forEach(window.top.findUserData);
    return;
  }

  if (typeof target === "object") {
    const objectKeys = Object.keys(target);
    if (objectKeys.length > 0) {
      objectKeys.forEach(key => {
        window.top.findUserData(target[key]);
      });
      return;
    }
  }
};

export default config;
