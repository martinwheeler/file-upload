import "@babel/polyfill";
import { render } from "react-dom";
import Upload from "./components/uploads";
import Form from "./components/form";

render(<Upload />, document.querySelector("#uploadApp"));
render(<Form />, document.querySelector("#uploadForm"));
