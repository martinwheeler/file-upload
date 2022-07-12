// TODO: Replace with a typed lib
import JSZipUtils from "jszip-utils";

interface File {
  name: String;
}

const toBinary = ({ metadata: { mediaLink } }) => {
  return new Promise((resolve, reject) => {
    JSZipUtils.getBinaryContent(mediaLink, (error, data) => {
      if (error) {
        reject(error); // or handle the error
      }
      resolve(data);
    });
  });
};

const toDataURL = ({ metadata: { mediaLink } }) => {
  return fetch(mediaLink)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    )
    .then((dataUrl: string) => dataUrl.replace(/^data:.*;base64,/, ""));
};

export { toBinary, toDataURL };
