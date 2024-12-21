import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      // 必填, 作为远程模块的模块名称
      name: 'host',
      remotes: {
        // 作为本地模块引用的远程模块入口文件, [远程模块名称]: [远程模块入口文件地址]
        remote: 'http://localhost:8001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 8000,
  },
});
