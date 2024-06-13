import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";
import CustomEditor from "./components/CustomEditor";
import { Editor as TinyMCEEditor } from "tinymce";
import useInterval from "./hooks/useInterval";

/** 定时器 */
let timer = null as any;

/** iframe的url */
let iframeUrl = "";

/** iframe 上的编辑按钮 */
let iframeEditBtn: Element | undefined;

/** 大文本字符 */
const largeText = "<div>我是文本</div>".repeat(7000);

/** 大文本分隔符 */
const largeTextSeparator = "<!-- largeTextSeparator -->";

function App() {
  const editorRef = useRef<TinyMCEEditor>(null);

  const originalValue = useRef(""); // 存储原始信息

  const [initValue, setInitValue] = useState(""); // 初始化富文本内容

  /** 组件卸载事件 */
  const handleUnmount = () => {
    // 移出监听事件
    iframeEditBtn?.removeEventListener("click", () => {});

    // 释放iframe的url
    URL.revokeObjectURL(iframeUrl);

    // 取消定时器
    clearTimeout(timer);
  };

  /** 设置 富文本 大文本样式 */
  const handleLargeText = (body: string) => {
    if (!body) return "";

    // 包含标签等长度
    if (body.length > 100000) {
      // 将html字符串转换成blob对象
      const blob = new Blob([body], { type: "text/html; charset=utf-8" });

      // 将blob对象转换成url
      iframeUrl = URL.createObjectURL(blob);

      // 存储原始信息
      originalValue.current = body;

      // 设置iframe的内容
      const innerHTML = `
        <div></div>

        ${largeTextSeparator}
        
        <div id='largeText' class='reply-content-ref'>
          <div 
            style='
              height: 52px;
              display: flex;
              background: #F7F8FB;
              align-items: center;
              justify-content: space-between;
              padding: 0 20px;
              color: #686C73;
              border: 1px solid #EBEDF0;
              border-bottom: none;
              box-sizing: border-box;
              outline: none;
            '
            disabled="true"
            contenteditable="false"
          >
            为了更好的体验，当前引用内容为只读模式
            <a 
              class="editor-quote-btn"
              style='
                display: flex;
                cursor: pointer;
                color: #017AFF;
              '
            >编辑</a>
          </div>

          <iframe 
            id="ref-mail-container"
            style='
              width: 100%;
              height: 300px;
              border: 1px solid #EBEDF0;
              border-top: none;
              box-sizing: border-box;
              margin: 0;
              cursor: default;
              outline: none;
            '
            contenteditable="false"
            src=${iframeUrl}
            loading='lazy'
          >
          </iframe>
        </div>  
      `;

      return innerHTML;
    } else {
      return body;
    }
  };

  /** 初始化页面 - 设置富文本 */
  useEffect(() => {
    // 1.使用 ref + initialValue
    setInitValue(largeText);

    // 2.使用 handleLargeText + useLayoutEffect
    // setInitValue(handleLargeText(largeText));
  }, []);

  /** 初始化页面 - 超大文本 iframe 添加点击事件 */
  // useLayoutEffect(() => {
  //   // 延迟执行, 等待 dom 加载完成
  //   timer = setTimeout(() => {
  //     // 获取富文本的内容
  //     const editorBody = editorRef.current?.getBody();

  //     // 获取iframe上的编辑按钮, 并添加监听事件
  //     iframeEditBtn = editorBody?.getElementsByClassName("editor-quote-btn")?.[0];
  //     if (!iframeEditBtn) return; // 没有编辑按钮则不执行

  //     iframeEditBtn?.addEventListener?.("click", function (event) {
  //       event.preventDefault(); // 阻止默认链接行为，避免跳转

  //       const newText = editorBody?.innerHTML.split(largeTextSeparator)?.[0]; // 获取富文本的内容
  //       editorRef.current?.setContent(newText + originalValue.current); // 设置新的值
  //       originalValue.current = ""; // 清空原始信息
  //       handleUnmount(); // 组件卸载事件
  //     });

  //     // 隐藏 iframe 中的 span 遮罩层 (防止不能滚动)
  //     const iframeMask = editorBody?.getElementsByClassName?.("mce-shim")?.[0];
  //     if (iframeMask) iframeMask.style.visibility = "hidden";
  //   }, 1000);

  //   return () => handleUnmount();
  // }, []);

  /** 提交事件 */
  const handleSave = useCallback((e?: any) => {
    // ctrl + s 保存时获取不到 editorContent, 故从参数中获取
    const realValue = editorRef.current?.getContent();
    const mergetText = originalValue.current ? realValue?.split(largeTextSeparator)?.[0] + originalValue.current : realValue;
    console.log("%c 提交的内容: ", "color: red", mergetText);
  }, []);

  // 每60s自动保存
  // useInterval(handleSave, 60000);

  return (
    <div className="page">
      <CustomEditor editorRef={editorRef} initialValue={initValue} onEditorSave={handleSave} />
    </div>
  );
}

export default App;
