import React, { PureComponent, Fragment } from "react";
import { css } from "glamor";

const imageStyle = {
  marginRight: "10px",
  marginBottom: "10px"
};

const otherFile = css({
  width: "50px",
  height: "50px",
  background:
    "url(https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/src/document-text.svg) no-repeat",
  backgroundPosition: "center",

  display: "flex",
  justifyContent: "center",
  marginBottom: "15px",
  position: "relative",
  "&:hover": {
    cursor: "pointer",
    "> span": {
      overflow: "initial",
      backgroundColor: "white",
      width: "auto",
      zIndex: "1",
      boxShadow: "0 4px 2px rgba(0,0,0,0.5)"
    }
  }
});

const labelStyles = css({
  padding: "0 5px",
  minWidth: "50px",
  width: "100%",
  position: "absolute",
  bottom: "-10px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  fontSize: "12px",
  textAlign: "center"
});

const validImageFiles = /\.(gif|jpe?g|tiff|png)$/i;
const documentFormats = /\.(pdf|doc|docx|txt|md)$/i;

interface FileMeta {
  mediaLink: String;
}
interface File {
  name: String;
  metadata: FileMeta;
}

interface FileProps {
  data: Array<File>;
}

class Files extends PureComponent {
  props: FileProps;

  render() {
    const { data } = this.props;

    return (
      <Fragment>
        {data.map((file: File) => {
          console.warn("FILES: ", file);

          const isImage = file.name.match(validImageFiles) !== null;

          return isImage ? (
            <a
              target={"_blank"}
              rel="noreferrer"
              style={{ border: "none" }}
              href={file.metadata.mediaLink}
              key={file.name}
              download={file.name}
            >
              <img
                src={file.metadata.mediaLink}
                alt={file.name}
                height="80px"
                style={imageStyle}
              />
            </a>
          ) : (
            <a
              href={file.secure_url}
              target="_blank"
              rel="noreferrer"
              key={file.filename}
              style={{ border: "none" }}
              download={file.filename}
            >
              <div className={`${otherFile}`}>
                <span className={`${labelStyles}`}>{file.filename}</span>
              </div>
            </a>
          );
        })}
      </Fragment>
    );
  }
}

export default Files;
