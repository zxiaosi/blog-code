import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
// federation参数参考 https://github.com/originjs/vite-plugin-federation?tab=readme-ov-file#configuration
export default defineConfig({
  plugins: [
    react(),
    federation({
      // 必填, 作为远程模块的模块名称
      name: 'remote',
      // 非必填, 作为远程模块的入口文件, 默认为 remoteEntry.js
      filename: 'remoteEntry.js',
      // 向公众公开的组件列表
      exposes: {
        './CustomButton': './src/components/CustomButton/index.tsx',
      },
      // 本地和远程模块共享的依赖项. 本地模块需要配置所有使用的远程模块的依赖; 远程模块需要配置外部提供的组件的依赖.
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 8001,
  },
  preview: {
    // 生产端口
    // 只有 Host 端支持 dev 模式，Remote 端要求使用 生成 RemoteEntry.js 包.
    // 详见: https://github.com/originjs/vite-plugin-federation?tab=readme-ov-file#vite-dev-mode
    port: 8001,
  },
  build: {
    // 处理报错: ERROR: await is not available in the configured target environmentTop-level
    // 详见: https://github.com/originjs/vite-plugin-federation?tab=readme-ov-file#error-top-level-await-is-not-available-in-the-configured-target-environment
    target: 'esnext',
  },
});
