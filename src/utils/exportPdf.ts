import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * 参考:
 *  - https://juejin.cn/post/7138370283739545613
 *  - https://gitee.com/jseven68/vue-pdf2
 */

interface OutPutPDFParams {
  /** 页眉dom元素 */
  header?: HTMLElement;
  /** 页脚dom元素 */
  footer?: HTMLElement;
  /** 需要转换的dom根节点 */
  element: HTMLElement;
  /** 一页pdf的内容宽度，0-592.28 */
  contentWidth?: number;
  /** pdf文件名 */
  filename?: string;
}

interface CanvasData {
  width: number;
  height: number;
  data: string;
}

/** A4纸的宽度 */
const A4_WIDTH = 592.28;

/** A4纸的高度 */
const A4_HEIGHT = 841.89;

/**
 * 将元素转化为canvas元素
 * @param element 需要转化的元素
 * @param width 内容宽度
 * @returns 返回canvas元素的宽度、高度、转化后的图片Data
 */
async function toCanvas(element: HTMLElement, width: number): Promise<CanvasData> {
  // canvas元素
  const canvas = await html2canvas(element, {
    // allowTaint: true, // 允许渲染跨域图片
    scale: window.devicePixelRatio * 2, // 通过 放大 增加清晰度
    useCORS: true, // 允许跨域
  });

  // 获取canavs转化后的宽度
  const canvasWidth = canvas.width;

  // 获取canvas转化后的高度
  const canvasHeight = canvas.height;

  // 高度转化为PDF的高度
  const height = (width / canvasWidth) * canvasHeight;

  // 转化成图片Data
  const canvasData = canvas.toDataURL("image/jpeg", 1.0);

  return { width, height, data: canvasData };
}

/**
 * 添加页眉
 * @param header 页眉元素
 * @param pdf jsPDF实例
 * @param contentWidth 内容宽度
 */
async function addHeader(header: HTMLElement, pdf: jsPDF, contentWidth: number) {
  const { height: headerHeight, data: headerData } = await toCanvas(header, contentWidth);
  pdf.addImage(headerData, "JPEG", 0, 0, contentWidth, headerHeight);
}

/**
 * 添加页脚
 * @param pageSize 页数
 * @param pageNo 当前页码
 * @param footer 页脚元素
 * @param pdf jsPDF实例
 * @param contentWidth 内容宽度
 */
async function addFooter(pageSize: number, pageNo: number, footer: HTMLElement, pdf: jsPDF, contentWidth: number) {
  // 页码元素，类名这里写死了
  const pageNoDom = footer.querySelector(".pdf-footer-page") as HTMLElement;
  const pageSizeDom = footer.querySelector(".pdf-footer-page-count") as HTMLElement;
  if (pageNoDom) pageNoDom.innerText = pageNo + "";
  if (pageSizeDom) pageSizeDom.innerText = pageSize + "";

  const { height: footerHeight, data: footerData } = await toCanvas(footer, contentWidth);
  pdf.addImage(footerData, "JPEG", 0, A4_HEIGHT - footerHeight, contentWidth, footerHeight);
}

/**
 * 截取图片添加到pdf中
 * @param _x x坐标
 * @param _y y坐标
 * @param pdf jsPDF实例
 * @param data 图片data
 * @param width 宽度
 * @param height 高度
 */
function addImage(_x: number, _y: number, pdf: jsPDF, data: string, width: number, height: number) {
  pdf.addImage(data, "JPEG", _x, _y, width, height);
}

/**
 * 添加空白遮挡
 * @param x x 与 页面左边缘的坐标
 * @param y y 与 页面上边缘的坐标
 * @param width 填充宽度
 * @param height 填充高度
 * @param pdf jsPDF实例
 */
function addBlank(x: number, y: number, width: number, height: number, pdf: jsPDF) {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, Math.ceil(width), Math.ceil(height), "F");
}

/**
 * 获取元素距离网页顶部的距离
 * @param element dom元素
 * @returns 距离顶部的高度
 */
function getElementTop(element: any) {
  let actualTop = element.offsetTop;
  let current = element.offsetParent;

  // 通过遍历offsetParant获取距离顶端元素的高度值
  while (current && current !== null) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }

  return actualTop;
}

/**
 * 生成pdf(A4多页pdf截断问题， 包括页眉、页脚 和 上下左右留空的护理)
 * - 内容与页眉、页脚之间留空留白的高度 - baseY
 * - 强制分页的标记点 - split-page
 * - 自动分页标记 - divide-inside
 * @param props {@link OutPutPDFParams}
 */
export async function outputPDF({ element, contentWidth = 550, footer, header, filename = "temp.pdf" }: OutPutPDFParams) {
  // 如果 dom根节点 不存在, 则直接返回
  if (!(element instanceof HTMLElement)) return;

  // jsPDFs实例
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "p" });

  /** 根元素距离网页顶部的距离 */
  const elementTop = getElementTop(element) || 0;

  /** 页眉元素的高度 */
  let headerHeight = 0;

  /** 页脚元素的高度 */
  let footerHeight = 0;

  if (header) {
    // 页眉元素 经过转换后在PDF的高度
    const headerCanvas = await toCanvas(header, contentWidth);
    headerHeight = headerCanvas.height;
  }

  if (footer) {
    // 页脚元素 经过转换后在PDF页面的高度
    const footerCanvas = await toCanvas(footer, contentWidth);
    footerHeight = footerCanvas.height;
  }

  // 距离 PDF 左边的距离, / 2 表示居中 - 左右边距
  const baseX = (A4_WIDTH - contentWidth) / 2;

  // 距离 PDF 页眉和页脚的间距, 留白留空
  const baseY = 15;

  // 除去页眉、页脚、还有内容与两者之间的间距后, 每页内容的实际高度
  const originalPageHeight = A4_HEIGHT - headerHeight - footerHeight - 2 * baseY;

  // 元素在网页页面的宽度
  const elementWidth = element.offsetWidth;

  // PDF内容宽度 和 在HTML中宽度 的比, 用于将 元素在网页的高度 转化为 PDF内容内的高度, 将 元素距离网页顶部的高度  转化为 距离Canvas顶部的高度
  const rate = contentWidth / elementWidth;

  // 每一页的分页坐标, PDF高度， 初始值为根元素距离顶部的距离
  const pages = [0];

  /**
   * 普通元素 - 位置更新方法
   * @param top 元素距离顶部的高度
   */
  function updateNormalElPos(top: number) {
    const prevTop = pages.length > 0 ? pages[pages.length - 1] : 0;

    // 当前距离顶部高度 - 上一个分页点的高度 大于 正常一页的高度, 则需要载入分页点
    if (top - prevTop > originalPageHeight) pages.push(prevTop + originalPageHeight);
  }

  /**
   * 存在可能跨页的元素 - 位置更新方法
   * @param elHeight 元素高度
   * @param top 元素距离顶部的高度
   */
  function updatePos(elHeight: number, top: number) {
    const prevTop = pages.length > 0 ? pages[pages.length - 1] : 0;

    // 同 updateNormalElPos 方法
    if (top - prevTop >= originalPageHeight) {
      pages.push(prevTop + originalPageHeight);
      return;
    }

    // 当前距离顶部高度 + 元素自身高度 - 上一个分页点的高度 大于 一页内容的高度, 则证明元素跨页
    // top != prevTop 这个条件是防止多个元素嵌套情况下，他们 top 是一样的
    if (top + elHeight - prevTop > originalPageHeight && top !== prevTop) {
      pages.push(top);
      return;
    }
  }

  /**
   * 对于富文本元素，观察所得段落之间都是以<p> / <img> 元素相隔，因此不需要进行深度遍历 (仅针对个人遇到的情况)
   */
  function traversingEditor(nodes: NodeListOf<ChildNode>) {
    // 遍历子节点
    for (let i = 0; i < nodes.length; ++i) {
      const one = nodes[i] as HTMLElement;
      const { offsetHeight } = one;
      const offsetTop = getElementTop(one);
      const top = (contentWidth / elementWidth) * offsetTop;
      updatePos((contentWidth / elementWidth) * offsetHeight, top);
    }
  }

  /** 遍历正常的元素节点 */
  function traversingNodes(nodes: NodeListOf<ChildNode>) {
    for (let i = 0; i < nodes.length; ++i) {
      /** 当前节点 */
      const one = nodes[i] as HTMLElement;

      /** 分页标记 - 强制分页的标记点 */
      const isSplit = one.classList && one.classList.contains("split-page");

      /** 自动分页标记 - 根据元素高度自动判断是否需要分页 */
      const isDivideInside = one.classList && one.classList.contains("divide-inside");

      /** 终点元素 - 图片元素作为深度终点, 不再继续深入 */
      const isIMG = one.tagName === "IMG";

      /** 终点元素 - table的每一行元素也作为深度终点, 不再继续深入, 自定义(antd table 组件) */
      const isTableCol = one.classList && one.classList.contains("ant-table-row");

      /** 特殊元素 - 富文本元素 */
      const isEditor = one.classList && one.classList.contains("editor");

      // 对需要处理分页的元素, 计算是否跨界, 若跨界, 则直接将顶部位置作为分页位置, 进行分页, 且子元素不需要再进行判断
      const { offsetHeight } = one;

      // 计算出距离顶部最终高度 【减去根元素距离网页顶部的高度】
      const offsetTop = getElementTop(one) - elementTop;

      // dom转换后距离顶部的高度 => 转换成canvas高度
      const top = rate * offsetTop;

      if (isSplit) {
        pages.push(top); // 将当前高度作为分页位置
        traversingNodes(one.childNodes); // 执行深度遍历操作
        continue;
      }

      if (isDivideInside) {
        updatePos(rate * offsetHeight, top); // 执行位置更新操作
        traversingNodes(one.childNodes); // 执行深度遍历操作
        continue;
      }

      if (isTableCol || isIMG) {
        // dom高度转换成生成pdf的实际高度
        // 代码不考虑dom定位、边距、边框等因素, 需在dom里自行考虑, 如将box-sizing设置为border-box
        updatePos(rate * offsetHeight, top);
        continue;
      }

      if (isEditor) {
        updatePos(rate * offsetHeight, top); // 执行位置更新操作
        traversingEditor(one.childNodes); // 遍历富文本节点
        continue;
      }

      // 对于普通元素, 则判断是否高度超过分页值, 并且深入
      updateNormalElPos(top); // 执行位置更新操作
      traversingNodes(one.childNodes); // 遍历子节点
    }

    return;
  }

  // 深度遍历节点的方法
  traversingNodes(element.childNodes);

  // 一页的高度， 转换宽度为一页元素的宽度
  const { width, height, data } = await toCanvas(element, contentWidth);

  // 可能会存在遍历到底部元素为深度节点，可能存在最后一页位置未截取到的情况
  // if (pages[pages.length - 1] + originalPageHeight < height) {
  //   pages.push(pages[pages.length - 1] + originalPageHeight);
  // }

  // 根据分页位置 开始分页
  for (let i = 0; i < pages.length; ++i) {
    console.log(`%c共${pages.length}页, 生成第${i + 1}页`, "color: yellow");

    // 向 PDF 中添加 canvas 图片 (dom元素)
    addImage(baseX, baseY + headerHeight - pages[i], pdf, data, width, height);

    // 将 内容 与 页眉之间留空留白的部分进行遮白处理
    addBlank(0, headerHeight, A4_WIDTH, baseY, pdf);

    // 将 内容 与 页脚之间留空留白的部分进行遮白处理
    addBlank(0, A4_HEIGHT - baseY - footerHeight, A4_WIDTH, baseY, pdf);

    // 对于除最后一页外，对 内容 的多余部分进行遮白处理
    if (i < pages.length - 1) {
      // 获取当前页面需要的内容部分高度
      const imageHeight = pages[i + 1] - pages[i];

      // 对多余的内容部分进行遮白
      addBlank(0, baseY + imageHeight + headerHeight, A4_WIDTH, A4_HEIGHT - imageHeight, pdf);
    }

    // 添加页眉
    if (header) await addHeader(header, pdf, A4_WIDTH);

    // 添加页脚
    if (footer) await addFooter(pages.length, i + 1, footer, pdf, A4_WIDTH);

    // 若不是最后一页，则分页
    if (i !== pages.length - 1) {
      // 增加分页
      pdf.addPage();
    }
  }

  return pdf.save(filename);
}
