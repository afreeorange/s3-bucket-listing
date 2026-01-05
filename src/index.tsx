/* @refresh reload */
import { MetaProvider } from "@solidjs/meta";
import { render } from "solid-js/web";

import App from "./App";

const root = document.getElementById("root");

if (root) {
  render(
    () => (
      <MetaProvider>
        <App />
      </MetaProvider>
    ),
    root,
  );
} else {
  throw new Error("Missing root node lol 🤣💥");
}
