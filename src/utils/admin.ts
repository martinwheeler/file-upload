function contains(selector: string, text: string) {
  var elements = document.querySelectorAll(selector);
  return Array.prototype.filter.call(elements, function (element) {
    return RegExp(text).test(element.textContent);
  })[0];
}

function containsAElement(start: HTMLElement) {
  return start?.querySelectorAll("a")?.length > 0;
}

function getSiblings(start: HTMLElement) {
  const firstSibling = start.nextElementSibling;
  let allSiblings: HTMLElement[] = [start];

  if (firstSibling) {
    let sibling = firstSibling as HTMLElement;
    while (sibling) {
      allSiblings.push(sibling);
      sibling = sibling.nextElementSibling as HTMLElement;
    }
  }

  return allSiblings;
}

function findMenuElement(startElement: HTMLElement) {
  let menuElement: HTMLElement | boolean | null = null;
  let parentElement = startElement.parentElement as HTMLElement;

  while (!menuElement) {
    // Look into every sibling and see if they contain a elements
    const siblings = getSiblings(parentElement);
    siblings.forEach((s) => {
      if (containsAElement(s)) {
        menuElement = s;
        return s;
      }
    });

    //  Go up 1 parent
    parentElement = parentElement.parentElement as HTMLElement;

    if (parentElement === document.body) {
      // Short circuit once we have hit the body element
      menuElement = document.body;
    }
  }

  return menuElement;
}

function showUploadContent(event: MouseEvent) {
  console.log("SHOW UPLOAD CONTENT");

  // TODO: Find admin dialog right panel
  // TODO: Inject the upload react component there

  //   import("./components/uploads").then((Component) => {
  //     const Uploads = Component.default;
  //     render(
  //       <Uploads newDialog pageUrl={pageUrl} />,
  //       topWindow!.document.querySelector(
  //         "#newUploadDialogApp"
  //       )
  //     );
  //   });
}

function createUploadElement(menuElement: HTMLElement) {
  const menuEntryElement = menuElement.querySelector("a");
  const uploadMenuEntryElement = menuEntryElement?.cloneNode(
    true
  ) as HTMLElement;
  const uploadTitleElement = uploadMenuEntryElement.querySelector("p");
  uploadTitleElement!.innerText = "Upload";
  uploadMenuEntryElement!.onclick = showUploadContent;

  menuElement.appendChild(uploadMenuEntryElement);
}

export { findMenuElement, contains, createUploadElement };
