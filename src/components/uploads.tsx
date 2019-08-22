import React, { Component, Fragment } from "react";
import JSZip from "jszip";
import { css } from "glamor";
import get from "lodash/get";
import set from "lodash/set";
import { saveAs } from "file-saver";

import Files from "~/components/files";
import Folder from "~/components/folder";

import { USER_ID } from "~utils/squarespace";
import { toBinary, toDataURL } from "~utils/upload";
import developmentGlobals from "~utils/development-globals";

const { Static } = window;

const wrapper = {
  padding: "22px 0"
};

const fileContainer = {
  marginTop: "11px",
  padding: "20px",
  backgroundColor: "white"
};

const errorStyles = {
  color: "red",
  fontWeight: 500
};

const retryButton = {
  background: "#f6f6f6",
  boxShadow: "0 0 5px 0.1px rgba(0, 0, 0, 0.1)",
  padding: "0 5px",
  borderRadius: "3px",
  cursor: "pointer"
};

const folderInfo = {
  display: "flex",
  alignItems: "center",
  marginBottom: "22px"
};

const folderBreadcrumbs = {
  marginLeft: "10px",
  fontFamily: "monospace",
  background: "wheat",
  padding: "5px 10px"
};

const folderContainer = css({
  display: "flex",
  flexWrap: "wrap"
});

const backStyles = css({
  cursor: "pointer",
  "> svg": {
    "> rect": {
      width: "0",
      transition: "all .2s cubic-bezier(.4,0,.68,.06)",
      transform: "translate(0)"
    },

    "> path": {
      transition: "all .2s cubic-bezier(.4,0,.68,.06)",
      transform: "translate(0)"
    },

    "&:hover": {
      "> rect": {
        width: "15px",
        transition: "all .2s cubic-bezier(.32,.94,.6,1)",
        transform: "translate(-6px)"
      },
      "> path": {
        transition: "all .2s cubic-bezier(.32,.94,.6,1)",
        transform: "translate(-6px)"
      }
    },

    "> *": {
      fill: "#313131"
    }
  }
});

const disabledBackStyles = css({
  filter: "grayscale(100%)",
  cursor: "default",
  pointerEvents: "none"
});

const downloadStyles = css({
  fontFamily: "monospace",
  marginLeft: "10px",
  cursor: "pointer",
  background:
    "url(https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/src/download.svg) no-repeat",
  width: "24px",
  height: "24px"
});

const oldDialogHeading = css({
  fontWeight: 500
});

const newDialogHeading = css({
  display: "block",
  color: "#313131",
  fontSize: "22px",
  marginBottom: "22px",
  fontWeight: "500"
});

const tapLog = data => {
  console.warn("DATA: ", data);
  return data;
};

const getBreadcrumb = ({ path, baseName }) =>
  path.replace(/\./g, "/").replace(new RegExp(`${baseName}/?`, "g"), "");

interface File {
  name: String;
}

const validImageFiles = /\.(gif|jpe?g|tiff|png)$/i;

const getFiles = (files: Array<File>) =>
  files.map(file => {
    const isImage = file.name.match(validImageFiles) !== null;
    if (isImage) {
      return toDataURL(file);
    }
    return toBinary(file);
  });

interface Props {
  pageUrl: string;
  newDialog: boolean;
}

class Uploads extends Component<Props> {
  static defaultProps: Props = {
    pageUrl: "join-the-team",
    newDialog: false
  };

  folderBaseName: string = "";
  state = {
    loading: true,
    error: null,
    folderBreadcrumb: "",
    openFolder: "",
    folders: []
  };

  zipFile = new JSZip();

  constructor(props) {
    super(props);

    this.folderBaseName = `${Static.SQUARESPACE_CONTEXT.website.identifier}-${
      Static.SQUARESPACE_CONTEXT.website.id
    }`;

    this.state = {
      loading: !!props.pageUrl,
      error: props.pageUrl
        ? null
        : "Sorry, we need you to enter a URL Slug under the Basic tab before Uploads will work correctly.",
      folderBreadcrumb: tapLog(
        getBreadcrumb({
          path: `${this.folderBaseName}.${props.pageUrl}`,
          baseName: this.folderBaseName
        })
      ),
      openFolder: `${this.folderBaseName}.${props.pageUrl}`
    };

    this.handleBack = this.handleBack.bind(this);
    this.fetchUploads = this.fetchUploads.bind(this);
    this.downloadZipFile = this.downloadZipFile.bind(this);
    this.handleFolderSelect = this.handleFolderSelect.bind(this);
  }

  componentWillUnmount() {
    const rootEl = document.querySelector("#newUploadDialogApp");
    const bodyEl = rootEl.parentElement.querySelector(
      "div[class^='Body-container-']"
    );
    setTimeout(() => {
      rootEl.remove();
      bodyEl.style.display = "flex";
    });
  }

  async componentDidMount() {
    this.fetchUploads({});
  }

  fetchUploads(e) {
    const { openFolder } = this.state;
    const { pageUrl } = this.props;

    try {
      e.preventDefault();
      e.stopPropagation();
    } catch (error) {
      // Throw the error if we care about it
      if (
        !error.message.includes("stopPropagation") &&
        !error.message.includes("preventDefault")
      ) {
        throw error;
      }
    }

    this.setState({ loading: true }, async () => {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/v2/search`, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          referrer: "no-referrer",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Id": USER_ID
          },
          body: JSON.stringify({
            folder: `${this.folderBaseName}`
          })
        }).then(response => response.json());

        const newFolderLayout = response.files.reduce(
          (result, nextResource) => {
            const { name } = nextResource;
            let pathChunks = name.replace(/\.|@/g, "-").split("/");
            let folderPath = "default";

            if (name.charAt(name.length - 1) !== "/") {
              // WE KNOW THIS IS A FOLDER
              pathChunks.pop();
              folderPath = pathChunks.join(".");
            } else {
              // Ignore 🤷‍♂️
              return result;
            }

            const currentData = get(result, `${folderPath}.data`) || [];

            set(result, folderPath, {
              data: [...currentData, { ...nextResource, ourType: "file" }]
            });

            return result;
          },
          {}
        );

        const possibleFolderData = get(newFolderLayout, openFolder) || {};

        this.setState({
          loading: false,
          folders: newFolderLayout
          // openFolder: !!possibleFolderData ? openFolder : this.folderBaseName,
          // folderBreadcrumb: getBreadcrumb({
          //   path: `${this.folderBaseName}.${pageUrl}`,
          //   baseName: this.folderBaseName
          // })
        });
      } catch (error) {
        this.setState({ loading: false, error: error });
      }
    });
  }

  handleBack() {
    const { openFolder } = this.state;
    const paths = openFolder.split(".");

    // We only want to go back up to the top most directory
    // There is nothing else for the user to look at
    if (paths.length === 1) {
      return;
    }

    paths.pop();
    const newPath = paths.join(".");
    this.handleFolderSelect({}, newPath);
  }

  handleFolderSelect(e, path) {
    try {
      e.stopPropagation();
      e.preventDefault();
    } catch (error) {
      // Throw the error if we care about it
      if (
        !error.message.includes("stopPropagation") &&
        !error.message.includes("preventDefault")
      ) {
        throw error;
      }
    }

    this.setState({
      openFolder: path,
      folderBreadcrumb: getBreadcrumb({ path, baseName: this.folderBaseName })
    });
  }

  async downloadZipFile(e) {
    e.stopPropagation();
    e.preventDefault();

    this.zipFile = new JSZip();

    const { folders, openFolder, folderBreadcrumb } = this.state;

    const folderData = get(folders, openFolder) || {};

    if (developmentGlobals.debugMode) {
      console.warn(
        "DOWNLOADING: ",
        folders,
        openFolder,
        folderData,
        folderBreadcrumb
      );
    }

    let downloadedFiles: Array<Promise<any>> = [];

    const generateFolders = (data: any, zipFile: JSZip) => {
      if (developmentGlobals.debugMode) {
        console.warn("GENERATING: ", data);
      }

      Object.keys(data).forEach((fileKey: any) => {
        // WE HAVE SOME FILES
        if (fileKey === "data") {
          downloadedFiles.push(
            Promise.all(getFiles(data[fileKey])).then(readyToZipFiles => {
              readyToZipFiles.forEach((file, index) => {
                const fileData = data[fileKey][index];
                const folderPaths = new RegExp(/.*\//, "gi");
                const fileWithExtension = fileData.name.replace(
                  folderPaths,
                  ""
                );
                const isImage = fileData.name.match(validImageFiles) !== null;

                if (developmentGlobals.debugMode) {
                  console.warn({
                    file,
                    fileData,
                    fileWithExtension
                  });
                }

                zipFile.file(fileWithExtension, file, {
                  base64: isImage,
                  binary: !isImage
                });
              });
            })
          );

          return;
        }

        // Keep going with the next folder until we hit some files
        generateFolders(data[fileKey], zipFile.folder(fileKey));
      });
    };

    generateFolders(folderData, this.zipFile);

    Promise.all(downloadedFiles).then(() => {
      this.zipFile.generateAsync({ type: "blob" }).then((blobContent: any) => {
        saveAs(blobContent, `${folderBreadcrumb || "all-folders"}.zip`);
      });
    });
  }

  render() {
    const {
      loading,
      error,
      openFolder,
      folderBreadcrumb,
      folders
    } = this.state;
    const { newDialog } = this.props;

    return (
      <div style={wrapper}>
        <span className={`${newDialog ? newDialogHeading : oldDialogHeading}`}>
          Uploads
        </span>
        <div style={fileContainer}>
          {loading ? (
            <span>Loading ...</span>
          ) : error ? (
            <Fragment>
              <div>
                <span style={errorStyles}>{error.message}</span>
              </div>
              <div style={retryButton} onClick={this.fetchUploads}>
                Retry
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div style={folderInfo}>
                <div
                  className={`${backStyles} ${!openFolder &&
                    disabledBackStyles}`}
                  onClick={this.handleBack}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect
                      fill="currentColor"
                      width="0"
                      height="2"
                      x="7"
                      y="10"
                    />
                    <path
                      fill="currentColor"
                      d="M15.75 4H13L6 11L13 18H15.75L8.75 11L15.75 4Z"
                    />
                  </svg>
                </div>
                <div style={folderBreadcrumbs}>
                  Home
                  {openFolder &&
                    `${folderBreadcrumb.length ? "/" : ""}${folderBreadcrumb}`}
                </div>
                <div
                  className={`${downloadStyles}`}
                  onClick={this.downloadZipFile}
                >
                  {/* ZIP */}
                </div>
              </div>
              <div className={`${folderContainer}`}>
                {this.renderFolders(folders)}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }

  renderFolders(folders) {
    const { openFolder } = this.state;
    // openFolder is a string with dots to indicate how deep we are
    const folderData = get(folders, openFolder) || {};

    if (developmentGlobals.debugMode) {
      console.warn("RENDERING: ", folders, openFolder, folderData);
    }

    if (!Object.keys(folderData).length) {
      return <div>No files or folders have been uploaded yet.</div>;
    }

    return (
      <Fragment>
        {Object.keys(folderData).map(path => {
          const currentResources = folderData[path];
          // Render files
          if (path === "data") {
            return (
              <Files key={`${openFolder}${path}`} data={currentResources} />
            );
          }

          // Render folder
          return (
            <Folder
              key={`${openFolder}${path}`}
              onChange={this.handleFolderSelect}
              name={path}
              path={`${openFolder}.${path}`}
            />
          );
        })}
      </Fragment>
    );
  }
}

export default Uploads;
