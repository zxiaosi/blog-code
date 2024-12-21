## 参考：[@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)

### 包版本

- `node: ^20.18.0`
- `npm: ^10.8.2`
- `lerna: ^8.1.9`
- `vite: ^6.0.2`

## 项目搭建

### 使用 [lerna](https://www.lernajs.cn/) 创建一个 `monorepo` 项目。<font color='red'>(也可以直接创建两个项目)</font>

- 命令行执行 `npx lerna init`, 初始化项目

### 开启 [pnpm workspaces](https://pnpm.io/workspaces)

- `lerna.json` 中添加下面配置

  ```bash
  {
  "npmClient": "pnpm",
  "packages": ["packages/*"],
  ... // 其他配置
  }
  ```

- 在根目录下创建 `pnpm-workspace.yaml` 并添加下面配置

  ```yaml
  packages:
    - 'packages/*'
  ```

- 然后在根目录下创建 `packages` 目录 <font color='red'>（注意：名称要与上面配置的 `packages/*` 目录名称一致）</font>

## 进入 `packages` 创建项目 `host`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建项目 host
  pnpm create vite

  # Project name
  host

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/host/vite.config.ts` 中配置启动端口

  ```typescript
  export default defineConfig({
    server: {
      port: 8000,
    },
    ... // 其他配置
  });
  ```

## 进入 `packages` 创建项目 `remote`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建项目 remote
  pnpm create vite

  # Project name
  remote

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/remote/vite.config.ts` 中配置启动端口

  ```typescript
  export default defineConfig({
    server: {
      port: 8001,
    },
    ... // 其他配置
  });
  ```

## 为两个项目添加 [@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)

```bash
# -r 为所有项目执行命令
pnpm -r i @originjs/vite-plugin-federation -D

# 为 host 项目添加 @originjs/vite-plugin-federation
# pnpm -F host i @originjs/vite-plugin-federation -D
# 为 remote 项目添加 @originjs/vite-plugin-federation
# pnpm -F remote i @originjs/vite-plugin-federation -D
```

## 配置 `remote` 项目

- 在 `packages/remote/src/components/CustomButton/index.tsx` 中添加下面代码

  ```tsx
  interface Props {
    /** 按钮文案 */
    text?: string;
    /** 按钮点击事件 */
    onClick?: () => void;
    /** 按钮样式 */
    style?: React.CSSProperties;
    /** 按钮类名 */
    className?: string;
  }

  /** 自定义按钮 */
  const CustomButton = (props: Props) => {
    const { text, ...rest } = props;
    return <button {...rest}>{text}</button>;
  };

  export default CustomButton;
  ```

- 在 `packages/remote/src/components/index.ts` 中添加下面代码

  ```ts
  export { default as CustomButton } from './CustomButton/index.tsx';
  ```

- 修改 `packages/remote/src/App.tsx` 文件内容如下

  ```tsx
  import './App.css';
  import { CustomButton } from './components';

  function App() {
    return (
      <>
        <CustomButton text="Hello Remote" />
      </>
    );
  }

  export default App;
  ```

- 修改 `packages/remote/vite.config.ts` 文件内容如下

  ```ts
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
  ```

## 配置 `host` 项目

- 修改 `packages/host/src/App.tsx` 文件内容如下

  ```tsx
  import './App.css';
  import React from 'react';

  const CustomButton = React.lazy(() => import('remote/CustomButton'));

  function App() {
    return (
      <>
        <CustomButton text="Hello Host" />
      </>
    );
  }

  export default App;
  ```

- 修改 `packages/host/src/vite-env.d.ts` 文件内容如下

  ```ts
  /// <reference types="vite/client" />

  declare module 'remote/*' {
    import { ComponentType } from 'react';
    const component: ComponentType<any>;
    export default component;
  }
  ```

- 修改 `packages\host\vite.config.ts` 文件内容如下

  ```ts
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
  ```

## 启动项目

- 先启动 `remote` 项目 <font color='red'>(根目录下执行)</font>

  ```bash
  # 需要先打包项目, 生成 remoteEntry.js
  pnpm -F remote build

  # 启动项目
  pnpm -F remote run preview
  ```

- 再启动 `host` 项目 <font color='red'>(根目录下执行)</font>

  ```bash
  pnpm -F host dev
  ```

## 配置快捷命令

- 在根目录 `package.json` 中添加下面配置

  ```json
   "scripts": {
    "preinstall": "npx only-allow pnpm",
    "remote": "pnpm -F remote build && pnpm -F remote run preview",
    "host": "pnpm -F host dev",
    "bootstrap": "lerna bootstrap",
    "clean": "lerna clean && rimraf ./node_modules"
  },
  ... // 其他配置
  ```

- 执行 `pnpm run remote` 启动 `remote` 项目

- 执行 `pnpm run host` 启动 `host` 项目
