import { Navigate } from "react-router-dom";
import { clearLocal } from "../utils/auth";

/** 判断是否登录 -- 路由拦截 */
const IsAuth = ({ children }: { children: JSX.Element }) => {
  // const cookie = document.cookie; // cookie 标识
  const token = localStorage.getItem("token"); // token 标识

  /**
   * 这里应该在响应拦截器中处理. 后端返回401状态码，清除本地缓存
   * 但是这里只是模拟，所以直接清除
   */
  !token && clearLocal();

  return token ? children : <Navigate to={"/login"} replace />;
};

export default IsAuth;