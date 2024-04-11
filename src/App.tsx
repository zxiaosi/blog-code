import { Segmented } from "antd";
import "./App.css";
import { useEffect, useState } from "react";
import OnePage from "./components/OnePage";
import MultiplePages from "./components/MultiplePages";
import ForcedPagination from "./components/ForcedPagination";
import AutoPagination from "./components/AutoPagination";
import TablePagination from "./components/TablePagination";
import ImagePagination from "./components/ImagePagination";

type RouterParams = "onePage" | "multiplePages" | "forcedPagination" | "autoPagination" | "tablePagination" | "imagePagination";

/** options */
const options = [
  { label: "一页", value: "onePage" },
  { label: "多页", value: "multiplePages" },
  { label: "强制分页", value: "forcedPagination" },
  { label: "自动分页", value: "autoPagination" },
  { label: "表格分页", value: "tablePagination" },
  { label: "图片分页", value: "imagePagination" },
];

function App() {
  const [routerParams, setRouterParams] = useState<RouterParams>("onePage");

  useEffect(() => {
    const url = window.location.href;
    const params = url.split("/").pop() as RouterParams;
    if (options.map((_) => _.value).includes(params)) setRouterParams(params);
    else window.history.pushState({}, "", `/resizeBox`);
  }, [routerParams]);

  /** 跳转到指定页面 */
  const handleChange = (value: any) => {
    setRouterParams(value);
    window.history.pushState({}, "", `/${value}`);
  };

  return (
    <div className="page">
      <div className="segmented">
        <Segmented options={options} size="large" value={routerParams} onChange={handleChange} />
      </div>

      <div className="content">
        {routerParams === "onePage" && <OnePage />}
        {routerParams === "multiplePages" && <MultiplePages />}
        {routerParams === "forcedPagination" && <ForcedPagination />}
        {routerParams === "autoPagination" && <AutoPagination />}
        {routerParams === "tablePagination" && <TablePagination />}
        {routerParams === "imagePagination" && <ImagePagination />}
      </div>
    </div>
  );
}

export default App;
