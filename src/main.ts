import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // 导入所有图标

import "./main.css";

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router); // 挂载路由

app.mount("#app");
