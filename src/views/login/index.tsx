import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { setLocal } from "../../utils/auth";

const Index = () => {
  const navigate = useNavigate();

  /**
   * 登录
   */
  const handleLogin = async () => {
    navigate("/dashboard", { replace: true });
    setLocal("token", "zxiaosi")
  };

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h1>登录页</h1>
      <Button type="primary" onClick={handleLogin}>点击登录</Button>
    </div >
  );
};

export default Index;
