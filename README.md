## [qiankun 多个子应用共存](https://zxiaosi.com/archives/7cff5205.html)

### 包版本

- `node: ^20.18.0`
- `npm: ^10.8.2`
- `lerna: ^8.1.9`
- `vite: ^6.0.7`

## 项目搭建

### 使用 [lerna](https://www.lernajs.cn/) 创建一个 `monorepo` 项目。

- 命令行执行 `npx lerna init`, 初始化项目

### 开启 `npm workspaces`

- `lerna.json` 中添加下面配置

  ```bash
  {
  "npmClient": "npm",
  "packages": ["packages/*"],
  ... // 其他配置
  }
  ```

- 然后在根目录下创建 packages 目录 <font color='red'>（注意：名称要与上面配置的 packages/\* 目录名称一致）</font>

### 配置全局格式化工具（可选）

- 在 根目录下 创建 `.prettierrc` 文件

  ```json
  {
    "plugins": [
      "prettier-plugin-organize-imports",
      "prettier-plugin-packagejson"
    ],
    "printWidth": 80,
    "proseWrap": "never",
    "singleQuote": true,
    "trailingComma": "all",
    "overrides": [
      {
        "files": ".prettierrc",
        "options": {
          "parser": "json"
        }
      }
    ]
  }
  ```

- 在 根目录 下添加 `prettier-plugin-organize-imports` 和 `prettier-plugin-packagejson` 插件

  ```bash
  npm install prettier-plugin-organize-imports prettier-plugin-packagejson -D
  ```

### 进入 `packages` 创建主应用 `app`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建主应用 app
  npm create vite@latest

  # Project name
  app

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app/vite.config.ts` 文件中配置端口号

  ```typescript
  export default defineConfig({
    server: {
      port: 8000,
    },
    ... // 其他配置
  });
  ```

### 进入 `packages` 创建子应用 `app1`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建子应用 app1
  npm create vite@latest

  # Project name
  app1

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app1/vite.config.ts` 文件中配置端口号

  ```typescript
  export default defineConfig({
    server: {
      port: 8001,
    },
    ... // 其他配置
  });
  ```

### 进入 `packages` 创建子应用 `app2`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建子应用 app2
  npm create vite@latest

  # Project name
  app2

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app2/vite.config.ts` 文件中配置端口号

  ```typescript
  export default defineConfig({
    server: {
      port: 8002,
    },
    ... // 其他配置
  });
  ```

### 进入 `packages` 创建子应用 `app3`

- 依次执行下面命令

  ```bash
  # 进入 packages 目录
  cd ./packages

  # 创建子应用 app3
  npm create vite@latest

  # Project name
  app3

  # Select a framework
  React

  # Select a variant
  TypeScript + SWC
  ```

- 在 `packages/app3/vite.config.ts` 文件中配置端口号

  ```typescript
  export default defineConfig({
    server: {
      port: 8003,
    },
    ... // 其他配置
  });
  ```
