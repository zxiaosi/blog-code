import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default ({ mode }) => {
  // 环境变量文件夹
  const envDir = resolve(__dirname, './');
  // 静态资源服务的文件夹
  const publicDir = resolve(__dirname, '../../libs');
  // 加载环境变量
  const env = loadEnv(mode, envDir);

  return defineConfig({
    publicDir: publicDir,
    server: {
      port: Number(env.VITE_PORT),
    },
    preview: {
      port: Number(env.VITE_PORT),
    },
    plugins: [
      react(),
      // /**
      //  * 排除 react react-dom, 使用 cdn 加载
      //  * - https://github.com/umijs/qiankun/issues/581
      //  * - https://github.com/umijs/qiankun/issues/627
      //  */
      // viteExternalsPlugin({
      //   react: 'React',
      //   'react-dom': 'ReactDOM',
      //   'react-dom/client': 'ReactDOM',
      // }),
    ],
  });
};
