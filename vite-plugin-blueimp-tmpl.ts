// @ts-ignore
import tmpl from 'blueimp-tmpl';
import { Plugin } from 'vite';

interface Options {
  /** 匹配内容 */
  match?: RegExp;
  /** 匹配文件 */
  test?: RegExp;
  /** 模板数据 */
  data: Record<string, any>;
}

/**
 * 模板插件
 * - 匹配文件中的 //tmpl 内容
 * - 使用 blueimp-tmpl 进行模板编译 {% ... %} 中的表达式
 * - 通过 o.xxx 访问 data 对象中的数据
 * @example //tmpl {% o.name %}
 * @example
 * //tmpl {% if(o.platform == 'A') { %}
 * xxx
 * //tmpl {% } %}
 */
const vitePluginBlueimpTmpl = (props: Options): Plugin => {
  const { match = /\/\/tmpl/g, test = /src.+\.ts(x)?/, data = {} } = props;

  return {
    name: 'vite-plugin-blueimp-tmpl', // 插件名称
    enforce: 'pre', // 在 Vite 核心插件之前调用该插件, 打包之前运行
    transform: (code: string, id: string) => {
      // id 是文件路径, code 是文件内容
      if (test.test(id) && code.match(match)) {
        // 会将 //tmpl 替换为空
        const str = code.replace(match, '');

        /**
         * 使用 blueimp-tmpl 进行模板编译,
         * - https://www.npmjs.com/package/blueimp-tmpl#api
         * - 解析 {% ... %} 中的表达式, 并将 data 对象中的数据传入模板中
         */
        const tmplstr = tmpl(str)(data);

        console.log(id); // 打印出被处理的文件路径
        console.log(tmplstr); // 打印出处理后的文件内容

        return tmplstr;
      }
    },
  };
};

export default vitePluginBlueimpTmpl;
