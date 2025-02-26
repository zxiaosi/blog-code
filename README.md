## 问题

- `Qiankun` + `Vite` 作为子应用时，样式隔离无效, 即使配置了 `experimentalStyleIsolation: true` 也无效

- `Ant Design` 组件库样式隔离无效

## 解决方案

- 使用 [postcss-prefix-selector](https://www.npmjs.com/package/postcss-prefix-selector) 插件为样式添加前缀

- [Ant Design ConfigProvider](https://ant-design.antgroup.com/components/config-provider-cn#api) 配置 `prefixCls` 样式前缀

## 配置插件样式隔离

- 在子应用 `vite.config.ts` 中配置 `postcss-prefix-selector` 插件（[官方示例](https://www.npmjs.com/package/postcss-prefix-selector#usage-with-vite)）

  ```ts
  import prefixer from 'postcss-prefix-selector';

  export default defineConfig({
    css: {
      postcss: {
        plugins: [
          prefixer({
            prefix: '[data-qiankun-app]', // 这里的值要和 main.tsx 中的属性名保持一致
            transform(prefix, selector, prefixedSelector, filePath, rule) {
              if (selector.match(/^(html|body)/)) {
                return selector.replace(/^([^\s]*)/, `$1 ${prefix}`);
              }

              if (filePath.match(/node_modules/)) {
                return selector; // Do not prefix styles imported from node_modules
              }

              const annotation = rule.prev();
              if (
                annotation?.type === 'comment' &&
                annotation.text.trim() === 'no-prefix'
              ) {
                return selector; // Do not prefix style rules that are preceded by: /* no-prefix */
              }

              return prefixedSelector;
            },
          }),
        ],
      },
    },
  });
  ```

- 在子应用 `main.tsx` 中为根节点添加 `data-qiankun-app` 属性

  ```tsx
  import { createRoot } from 'react-dom/client';
  import {
    QiankunProps,
    qiankunWindow,
    renderWithQiankun,
  } from 'vite-plugin-qiankun/dist/helper';
  import App from './App.tsx';
  import './index.css';

  const render = (container?: HTMLElement) => {
    const app =
      container || (document.getElementById('root') as HTMLDivElement);

    /**
     * 添加属性，用于样式隔离
     * 注意：这里的属性名要和 postcss-prefix-selector 插件中的 prefix 保持一致
     */
    app.setAttribute('data-qiankun-app', 'true');

    createRoot(app).render(<App />);
  };

  /** Qiankun 生命周期钩子 */
  const qiankun = () => {
    renderWithQiankun({
      bootstrap() {},
      async mount(props: QiankunProps) {
        render(props.container);
      },
      update: (props: QiankunProps) => {},
      unmount: (props: QiankunProps) => {},
    });
  };

  if (qiankunWindow.__POWERED_BY_QIANKUN__) qiankun();
  else render();
  ```

- 下面是一个示例，可以在控制台中看到样式被添加了前缀，实现了样式隔离

  ```tsx
  import React from 'react';
  import './App.css';

  const App = () => {
    return <div className="app">Hello, Qiankun!</div>;
  };

  export default App;
  ```

  ```css
  .app {
    color: red;
  }

  // 在控制台中被转换成
  [data-qiankun-app] .app {
    color: red;
  }
  ```

- 实现跟 [qiankun experimentalStyleIsolation](https://qiankun.umijs.org/zh/api#loadmicroappapp-configuration) 类似的效果

![](https://cdn.zxiaosi.com/hexo/qiankun-vite-style/plugin.png)

## 配置组件库样式隔离

- 上面样式对自己写的类名生效，但是对于引入的组件库样式隔离可能无效

  ```tsx
  import { ConfigProvider } from 'antd';
  import App from './App';

  <ConfigProvider prefixCls="app">
    <App />
  </ConfigProvider>;
  ```

  ```css
  .app-btn {
    color: red;
  }
  ```

![](https://cdn.zxiaosi.com/hexo/qiankun-vite-style/config.png)
