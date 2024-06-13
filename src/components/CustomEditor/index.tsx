import { Editor } from "@tinymce/tinymce-react";
import React from "react";
import axios from "axios";
import { Editor as TinyMCEEditor } from "tinymce";

interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string | undefined;
}

interface Props {
  /** 富文本内容 */
  value?: string;
  /** 富文本内容变化事件 */
  onchangeValue?: (value: string) => void;
  /** 富文本高度 */
  height?: number | string;
  /** 初始化值 */
  initialValue?: string;
}

/**
 * 自定义富文本编辑器
 *
 * 官方文档: https://www.tiny.cloud/tinymce/
 * React使用文档: https://www.tiny.cloud/docs/tinymce/6/react-ref/#installing-the-tinymce-react-integration-using-npm-or-yarn
 * 下载社区版: https://www.tiny.cloud/get-tiny/self-hosted/
 * 下载语言包: https://www.tiny.cloud/get-tiny/language-packages/
 * 关于格式刷: https://www.tiny.cloud/docs/tinymce/6/full-featured-premium-demo/
 * 关于复制粘贴: https://www.tiny.cloud/docs/tinymce/6/introduction-to-powerpaste/
 * 自定义插件: https://www.tiny.cloud/docs/tinymce/latest/apis/tinymce.editor.ui.registry/
 * 自定义插件示例: https://www.tiny.cloud/docs/tinymce/6/custom-toolbarbuttons/
 */
const Index: React.FC<Props> = (props) => {
  const { value, onchangeValue, height = "300px", initialValue } = props;

  /** 保存 */
  const handleSave = (editor: TinyMCEEditor) => {
    alert(`保存成功 ${editor.getContent()}`);
  };

  /** 图片上传 */
  const handleUpload = async (blobInfo: BlobInfo): any => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", blobInfo.blob());
      axios.post("localhost:3000/api/upload", formData).then((data: any) => {
        if (data.url) resolve(data.url);
        else reject("上传失败");
      });
    });
  };

  /**
   * 初始化富文本
   *
   * 自定义插件参考:
   *    https://blog.csdn.net/byebukesi/article/details/132062864
   *    https://blog.csdn.net/snans/article/details/100862639
   * 官方文档: https://www.tiny.cloud/docs/tinymce/latest/apis/tinymce.editor.ui.registry/
   * 官方文档示例: https://www.tiny.cloud/docs/tinymce/6/custom-toolbarbuttons/
   */
  const handleInit = (editor: TinyMCEEditor) => {
    let toggleState = ""; // 切换状态

    // 注册自定义图标
    editor.ui.registry.addIcon(
      "translationIcon",
      `<svg t="1709617096310" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4825" width="20" height="20">
        <path d="M608 416h288c35.36 0 64 28.48 64 64v416c0 35.36-28.48 64-64 64H480c-35.36 0-64-28.48-64-64v-288H128c-35.36 0-64-28.48-64-64V128c0-35.36 28.48-64 64-64h416c35.36 0 64 28.48 64 64v288z m0 64v64c0 35.36-28.48 64-64 64h-64v256.032c0 17.664 14.304 31.968 31.968 31.968H864a31.968 31.968 0 0 0 31.968-31.968V512a31.968 31.968 0 0 0-31.968-31.968H608zM128 159.968V512c0 17.664 14.304 31.968 31.968 31.968H512a31.968 31.968 0 0 0 31.968-31.968V160A31.968 31.968 0 0 0 512.032 128H160A31.968 31.968 0 0 0 128 159.968z m64 244.288V243.36h112.736V176h46.752c6.4 0.928 9.632 1.824 9.632 2.752a10.56 10.56 0 0 1-1.376 4.128c-2.752 7.328-4.128 16.032-4.128 26.112v34.368h119.648v156.768h-50.88v-20.64h-68.768v118.272H306.112v-118.272H238.752v24.768H192z m46.72-122.368v60.48h67.392V281.92H238.752z m185.664 60.48V281.92h-68.768v60.48h68.768z m203.84 488H576L668.128 576h64.64l89.344 254.4h-54.976l-19.264-53.664h-100.384l-19.232 53.632z m33.024-96.256h72.864l-34.368-108.608h-1.376l-37.12 108.608zM896 320h-64a128 128 0 0 0-128-128V128a192 192 0 0 1 192 192zM128 704h64a128 128 0 0 0 128 128v64a192 192 0 0 1-192-192z" fill="#333333" p-id="4826"></path>
      </svg>`
    );

    // 添加自定义按钮 - 单个按钮
    editor.ui.registry.addButton("translation", {
      text: "翻译", // 按钮文字
      // icon: "translationIcon", // 按钮图标
      tooltip: "翻译", // 按钮提示
      onAction: () => {
        editor.insertContent("翻译");
        // 如果需要官方的弹框, 可以使用 editor.windowManager.open() 示例: https://www.tiny.cloud/docs/tinymce/6/creating-a-plugin/
        // 如果是自定义弹框, 可以使用使用 React 组件 - createPortal
      },
    });

    // 添加自定义按钮 - 按钮组
    editor.ui.registry.addMenuButton("translationMenu", {
      // text: '翻译', // 按钮文字
      icon: "translationIcon", // 按钮图标
      tooltip: "翻译", // 按钮提示
      fetch: (callback) => {
        const items = [
          {
            type: "togglemenuitem", // ['menuitem' - 普通菜单, 'nestedmenuitem' - 嵌套菜单, 'togglemenuitem' - 切换菜单]
            text: "zh",
            onAction: () => {
              toggleState = "zh";
              editor.insertContent("你好！");
            },
            onSetup: (api) => {
              api.setActive("zh" == toggleState);
              return () => {};
            },
          },
          {
            type: "togglemenuitem",
            text: "en",
            onAction: () => {
              toggleState = "en";
              editor.insertContent("Hello!");
            },
            onSetup: (api) => {
              api.setActive("en" == toggleState);
              return () => {};
            },
          },
        ];
        callback(items);
      },
    });
  };

  return (
    <div className="editor" style={{ height, minHeight: 400, width: "100%" }}>
      <Editor
        value={value}
        initialValue={initialValue}
        tinymceScriptSrc={"/tinymce/tinymce.min.js"} // 防止需要登录才能访问的情况
        init={{
          height: "100%",
          menubar: false, // 是否显示菜单栏
          contextmenu: false, // 是否显示右键菜单
          language: "zh-Hans", // 语言
          paste_data_images: true, // 是否粘贴图片
          remove_trailing_brs: true, // 删除尾部 br
          line_height_formats: "1 1.2 1.4 1.6 1.8 2.0", // 行高
          placeholder: "Ctrl + S 可保存邮件到草稿箱", // 占位符
          add_form_submit_trigger: true, // 添加表单提交触发器 ctrl+s
          save_onsavecallback: handleSave, // 保存回调
          toolbar_mode: "sliding", // 工具栏 更多按钮 的模式
          forced_root_block: "div", // 强制根节点为 div (回车符号, 间距过大问题)
          paste_webkit_styles: "all", // 保留所有 webkit 粘贴样式 eg: https://www.tiny.cloud/docs/tinymce/6/copy-and-paste/#paste_webkit_styles
          help_accessibility: true, // 帮助按钮是否可访问
          convert_urls: false, // TinyMCE 默认会将图片的 url 转换为相对路径, 这里禁用 (取得是 img 中 data-mce-src 的值)
          images_upload_handler: handleUpload, // 图片上传
          plugins: [
            "lists", // 列表 - bullist numlist
            "advlist", // 高级列表 - bullist numlist
            "charmap", // 字符映射表 - charmap
            "code", // 代码 - code
            "directionality", // 从左边/右边输入 - ltr rtl
            "emoticons", // 表情符号 - emoticons
            "fullscreen", // 全屏 - fullscreen
            "help", // 帮助(一些快捷键和编辑器信息) - help
            "image", // 图片 - image
            "insertdatetime", // 插入日期时间 - insertdatetime
            "link", // 链接 - link
            "media", // 媒体 - media
            "nonbreaking", // 不间断空格实体(&nbsp;) - nonbreaking
            "pagebreak", // 分页符 - pagebreak
            "preview", // 预览 - preview
            "quickbars", // 快捷工具栏 - quickbars_selection_toolbar
            "save", // 保存 - save
            "table", // 表格 - table
            "visualblocks", // 显示块级元素边框 - visualblocks
            "visualchars", // 显示不可见字符 - visualchars
            "wordcount", // 字数统计 - wordcount
            "translation", // 自定义插件
            "translationMenu", // 自定义插件
          ],
          toolbar:
            "translation translationMenu | undo redo removeformat | blocks fontfamily fontsize | bold italic underline |" +
            "forecolor backcolor | align lineheight | link emoticons table |" +
            "bullist numlist | preview fullscreen | outdent indent |" +
            "superscript subscript strikethrough blockquote charmap | ltr rtl |" +
            "visualchars visualblocks | hr nonbreaking pagebreak |" +
            "cut copy paste pastetext | code print insertdatetime |" +
            "image media wordcount help",
          font_css: "/tinymce/fonts/font.css", // 引入自定义字体, 详见: /public/tinymce/font/font.css
          font_family_formats: "微软雅黑=微软雅黑,宋体,sans-serif;" + "Times New Roman=times new roman,times;" + "Comic Sans MS=comic sans ms,sans-serif;" + "HarmonyOS=HarmonyOS;", // 自定义字体
          quickbars_insert_toolbar: false, // 禁用快捷插入
          quickbars_selection_toolbar: "bold italic underline translation translationMenu", // 快捷选择工具栏
          content_style: `body { font-family:"微软雅黑"; }`, // 内容样式
          setup: handleInit,
        }}
        onEditorChange={onchangeValue}
      />
    </div>
  );
};

export default Index;
