import React, { Component, Fragment } from "react";
import { css } from "glamor";

const shadowFrames = css.keyframes("shadowFrames", {
  "0%": {
    transform: "translateZ(0) translateX(0) translateY(0)",
    boxShadow: "0 0 0 0 transparent"
  },
  "100%": {
    transform: "translateZ(50px) translateX(12px) translateY(-12px)",
    boxShadow: "-12px 12px 20px -12px rgba(0, 0, 0, .35)"
  }
});

const folderStyles = css({
  display: "flex",
  justifyContent: "center",
  paddingBottom: "30px",
  width: "100%",
  height: "50px",
  background:
    "url(https://cdn.jsdelivr.net/gh/martinwheeler/undress-plugins@latest/src/folder.svg) no-repeat",
  backgroundPosition: "center",
  position: "relative",

  "&:hover": {
    cursor: "pointer",
    animation: `0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s 1 normal forwards running ${shadowFrames}`,

    "> span": {
      overflow: "initial",
      backgroundColor: "white",
      width: "auto",
      zIndex: "1"
    }
  }
});

const labelStyles = css({
  padding: "0 5px",
  minWidth: "50px",
  width: "100%",
  position: "absolute",
  bottom: "5px",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  fontSize: "12px",
  textAlign: "center"
});

class Folder extends Component {
  constructor(props) {
    super(props);

    this.handleOpen = this.handleOpen.bind(this);
  }

  handleOpen(e) {
    const { onChange, path } = this.props;
    onChange(e, path);
  }

  render() {
    const { name } = this.props;

    return (
      <div style={{ width: "25%" }}>
        <div className={`${folderStyles}`} onClick={this.handleOpen}>
          <span className={`${labelStyles}`}>{name}</span>
        </div>
      </div>
    );
  }
}

export default Folder;
