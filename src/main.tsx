import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* react-router-dom 的 BrowserRouter 组件: 使用浏览器的内置历史记录堆栈进行导航 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
