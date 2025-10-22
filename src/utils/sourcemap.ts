import { message } from 'antd';
import sourceMap from 'source-map-js';

/** 找到以.js结尾的fileName */
function matchStrUtil(str: string) {
  if (str.endsWith('.js')) return str.substring(str.lastIndexOf('/') + 1);
}

/** 将所有的空格转化为实体字符 */
function repalceAllUtil(str: string) {
  return str.replace(new RegExp(' ', 'gm'), '&nbsp;');
}

/** 加载sourceMap文件 */
function loadSourceMapUtil(fileName: string) {
  return new Promise((resolve, reject) => {
    // const file = matchStrUtil(fileName);
    // if (!file) return reject(false);
    fetch(`${fileName}.map`)
      .then((response) => response.json())
      .then((resp) => resolve(resp))
      .catch(() => {
        const msg = `加载sourceMap文件失败: ${fileName}.map 文件不存在`;
        message.error(msg);
        reject(msg);
      });
  });
}

/** 找到源码 */
export const findCodeBySourceMapUtil = async ({ fileName, line, column }: any, callback: any) => {
  console.log('fileName', fileName, line, column);
  const sourceData = await loadSourceMapUtil(fileName);
  if (!sourceData) return;
  const { sourcesContent, sources }: any = sourceData || {};
  const consumer = await new sourceMap.SourceMapConsumer(sourceData as any);
  const result = consumer.originalPositionFor({
    line: Number(line),
    column: Number(column),
  });
  /**
   * result结果
   * {
   *   "source": "webpack://myapp/src/views/HomeView.vue",
   *   "line": 24,  // 具体的报错行数
   *   "column": 0, // 具体的报错列数
   *   "name": null
   * }
   * */
  if (result.source && result.source.includes('node_modules')) {
    // 三方报错解析不了，因为缺少三方的map文件，
    // 比如echart报错 webpack://web-see/node_modules/.pnpm/echarts@5.4.1/node_modules/echarts/lib/util/model.js
    return message.error(`源码解析失败: 因为报错来自三方依赖，报错文件为 ${result.source}`);
  }

  let index = sources.indexOf(result.source);

  // 未找到，将sources路径格式化后重新匹配 /./ 替换成 /
  // 测试中发现会有路径中带/./的情况，如 webpack://web-see/./src/main.js
  if (index === -1) {
    const copySources = JSON.parse(JSON.stringify(sources)).map((item) =>
      item.replace(/\/.\//g, '/'),
    );
    index = copySources.indexOf(result.source);
  }
  if (index === -1) {
    return message.error(`源码解析失败: 未找到 ${result.source} 文件`);
  }
  const code = sourcesContent[index];
  const codeList = code.split('\n');
  const row = result.line,
    len = codeList.length - 1;
  const start = row - 5 >= 0 ? row - 5 : 0, // 将报错代码显示在中间位置
    end = start + 9 >= len ? len : start + 9; // 最多展示10行
  const newLines = [];
  let j = 0;
  for (let i = start; i <= end; i++) {
    j++;
    newLines.push(
      `<div class="code-line ${i + 1 == row ? 'heightlight' : ''}" title="${
        i + 1 == row ? result.source : ''
      }">${j}. ${repalceAllUtil(codeList[i])}</div>`,
    );
  }

  const innerHTML = `
    <div class="errdetail">
      <div class="errheader">
      ${
        import.meta.env.DEV
          ? `<a href="vscode://file/${consumer.file}:${result.line}:${result.column}">${consumer.file} at line ${result.column}:${row}</a>` // 开发环境打开vscode
          : `${result.source} at line ${result.column}:${row}` // 生产环境显示文件名和行号
      }
      </div>
      <div class="errcontent">${newLines.join('')}</div>
    </div>
  `;
  callback(innerHTML);
};
