import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginBlueimpTmpl from './vite-plugin-blueimp-tmpl';

// https://vite.dev/config/
export default () => {
  const platform = process.env.platform; // 获取环境变量
  console.log('platform', platform);

  return defineConfig({
    plugins: [vitePluginBlueimpTmpl({ data: { platform } }), react()],
  });
};
