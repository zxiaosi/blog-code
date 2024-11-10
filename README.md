# React19 Demo

## [官网链接](https://zh-hans.react.dev/blog/2024/04/25/react-19-upgrade-guide)

## 安装

- 安装 `react@rc` 和 `react-dom@rc` 依赖

```bash
npm install --save-exact react@rc react-dom@rc
```

- 删除 `package-lock.json` 文件, 在 `package.json` 中加入下面配置, 然后执行 `npm install`。下面的配置是使用 `types-react@rc` 和 `types-react-dom@rc` 的覆盖 `@types/react` 和 `@types/react-dom` 的配置。

```bash
"dependencies": {
  "@types/react": "npm:types-react@rc",
  "@types/react-dom": "npm:types-react-dom@rc"
},
"overrides": {
  "@types/react": "npm:types-react@rc",
  "@types/react-dom": "npm:types-react-dom@rc"
}
```
