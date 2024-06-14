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
  /** ref */
  editorRef?: any;
  /** 富文本内容 */
  value?: string;
  /** 富文本内容改变事件 */
  onChangeValue?: (value: string) => void;
  /** 富文本高度 */
  height?: number | string;
  /** 保存事件 */
  onEditorSave?: (editor: TinyMCEEditor) => void;
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
 */
const Index: React.FC<Props> = (props) => {
  const { editorRef, value, onChangeValue, height = "500px", onEditorSave, initialValue } = props;

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

  /** 富文本改变事件 */
  const handleEditorChange = (newValue: string, editor: TinyMCEEditor) => {
    onChangeValue?.(newValue);
  };

  return (
    <div className="editor" style={{ height, minHeight: 500, width: "100%" }}>
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
          // save_enablewhendirty: false, // 是否在内容无变化时启用保存按钮(慎用)
          add_form_submit_trigger: true, // 添加表单提交触发器 ctrl+s
          save_onsavecallback: onEditorSave, // 保存回调
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
            "save", // 保存 - save
            "table", // 表格 - table
            "visualblocks", // 显示块级元素边框 - visualblocks
            "visualchars", // 显示不可见字符 - visualchars
            "wordcount", // 字数统计 - wordcount
          ],
          toolbar:
            "undo redo removeformat | blocks fontfamily fontsize | bold italic underline |" +
            "forecolor backcolor | align lineheight | link emoticons table |" +
            "bullist numlist | preview fullscreen | outdent indent |" +
            "superscript subscript strikethrough blockquote charmap | ltr rtl |" +
            "visualchars visualblocks | hr nonbreaking pagebreak |" +
            "cut copy paste pastetext | code print insertdatetime |" +
            "image media wordcount help",
          font_css: "/tinymce/font/font.css", // 引入自定义字体, 详见: /public/tinymce/font/font.css
          font_family_formats:
            "微软雅黑=微软雅黑,宋体,sans-serif;" + //
            "Times New Roman=times new roman,times;" + //
            "Comic Sans MS=comic sans ms,sans-serif;" + //
            "自定义字体=custom font;", // 自定义字体(因为stackblitz单个文件不能大于1MB, 并没有实际引入, 实际使用时引入即可)
          content_style: `body { font-family:"微软雅黑"; }`,
        }}
        onInit={(evt, editor) => (editorRef.current = editor)}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default Index;
