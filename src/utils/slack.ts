function notify(message) {
  let payload = {
    text: message
  };

  if (typeof message === "object") {
    payload = message;
  }

  const service = "T4B6N7NUF/BL2G4PQFQ";
  const id = "zXAwbalq7wVgYitUnuDcTsbS";

  fetch(`//hooks.slack.com/${"services"}/${service}/${id}`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    referrer: "no-referrer",
    body: JSON.stringify(payload)
  });
}

export { notify };
