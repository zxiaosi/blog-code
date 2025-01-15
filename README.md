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
