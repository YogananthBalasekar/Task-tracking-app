import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";

import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);