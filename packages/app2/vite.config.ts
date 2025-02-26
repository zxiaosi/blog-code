import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import qiankun from 'vite-plugin-qiankun';

// https://vite.dev/config/
export default ({ mode }) => {
  const useDevMode = mode === 'development';
  const host = '127.0.0.1';
  const port = 8002;
  const subAppName = 'app2';
  const base = useDevMode
    ? `http://${host}:${port}/${subAppName}`
    : `/${subAppName}`; // 这里 subAppName 对应 createBrowserRouter 的 basename

  return defineConfig({
    base,
    server: {
      port,
      cors: true, // 作为子应用时，如果不配置，则会引起跨域问题
      origin: `http://${host}:${port}`, // 必须配置，否则无法访问静态资源
    },
    plugins: [
      // 在开发模式下需要把react()关掉
      // https://github.com/tengmaoqing/vite-plugin-qiankun?tab=readme-ov-file#3dev%E4%B8%8B%E4%BD%9C%E4%B8%BA%E5%AD%90%E5%BA%94%E7%94%A8%E8%B0%83%E8%AF%95
      ...[useDevMode ? [] : [react()]],
      qiankun(subAppName, { useDevMode }),
    ],
  });
};
