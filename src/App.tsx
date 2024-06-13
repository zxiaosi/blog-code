import { useState } from "react";
import CustomEditor from "./components/CustomEditor";
import "./App.css";

function App() {
  const [value, setValue] = useState("");

  return (
    <div className="page">
      <CustomEditor height={500} value={value} onchangeValue={setValue} />
    </div>
  );
}

export default App;
