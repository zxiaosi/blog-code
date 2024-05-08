import { Sheet, Cell, SheetConfig } from "@fortune-sheet/core";
import ExcelJS, { Alignment, Border, BorderStyle, Borders, CellModel, CellValue, DataValidation, Fill, Font, Workbook, Worksheet, WorksheetView } from "exceljs";
import { handleConvertReference, handleColorToARGB, handleOperator } from "./tool";
import { borderStyleMap, getValueByKey, horizontalAlignmentMap, textRotationMap, verticalAlignmentMap, wrapTextMap } from "./enum";

/**
 * excel 单元格默认的宽度和高度 是 8.43 和 15
 * - https://support.microsoft.com/zh-cn/office/%E6%9B%B4%E6%94%B9%E5%88%97%E5%AE%BD%E5%92%8C%E8%A1%8C%E9%AB%98-72f5e3cc-994d-43e8-ae58-9774a0905f46?ns=excel&version=21&syslcid=2052&uilcid=2052&appver=zxl210&helpid=20926&ui=zh-cn&rs=zh-cn&ad=cn
 *
 * fortune-sheet 单元格默认的宽度和高度 是 73 和 19
 * - https://ruilisi.github.io/fortune-sheet-docs/zh/guide/sheet.html#%E5%88%9D%E5%A7%8B%E5%8C%96%E9%85%8D%E7%BD%AE
 */

/** excel 默认列宽 */
const excelColWidth = 8.43;

/** excel 默认行高 */
const excelRowHeight = 15;

/** fortune-sheet 默认列宽 */
const defaultColWidth = 73;

/** fortune-sheet 默认行高 */
const defaultRowHeight = 19;

/** fortune-sheet 默认行数 */
const defaultRows = 36;

/** fortune-sheet 默认列数 */
const defaultColumns = 18;

/**
 * 处理行高、列宽、隐藏行、隐藏列
 */
const handleColumnRowLen = (worksheet: Worksheet, config: Sheet["config"]) => {
  if (!config) return worksheet;

  const { columnlen, rowlen, rowhidden, colhidden } = config;
  const conversionWidth = defaultColWidth / excelColWidth;
  const conversionHeight = defaultRowHeight / excelRowHeight;

  // 列长度
  if (columnlen) {
    const columns = Object.keys(columnlen);
    columns.forEach((column) => {
      worksheet.getColumn(Number(column) + 1).width = (columnlen?.[column] ?? 0) / conversionWidth;
    });
  }

  // 行高度
  if (rowlen) {
    const rows = Object.keys(rowlen);
    rows.forEach((row) => {
      worksheet.getRow(Number(row) + 1).height = (rowlen?.[row] ?? 0) / conversionHeight;
    });
  }

  // 隐藏行
  if (rowhidden) {
    const rows = Object.keys(rowhidden);
    rows.forEach((row) => {
      worksheet.getRow(Number(row) + 1).hidden = true;
    });
  }

  // 隐藏列
  if (colhidden) {
    const columns = Object.keys(colhidden);
    columns.forEach((column) => {
      worksheet.getColumn(Number(column) + 1).hidden = true;
    });
  }

  return worksheet;
};

/**
 * 处理图片: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%9B%BE%E7%89%87
 * - excelJs 不会处理已变化单元格的宽度 https://github.com/exceljs/exceljs/issues/2730
 * @param workbook 工作簿
 * @param worksheet 工作表
 * @param sheetData 工作表数据
 */
const handleImages = (workbook: Workbook, worksheet: Worksheet, sheetData: Sheet) => {
  const { row, column, images, config } = sheetData;

  if (!images) return worksheet;

  const { colhidden, columnlen, rowhidden, rowlen } = config || {};

  const columnObj = { ...colhidden, ...columnlen }; // 列对象
  const rowObj = { ...rowhidden, ...rowlen }; // 行对象

  const rowLen = row || defaultRows; // 行数
  const columnLen = column || defaultColumns; // 列数

  for (let i = 0; i < images?.length; i++) {
    const { src, height, width, left, top } = images?.[i] || {};

    let col = 0; // 图片所在列 0~1 表示一个单元格
    let row = 0; // 图片所在行 0~1 表示一个单元格
    let restLeft = left; // 剩余宽度
    let restTop = top; // 剩余高度

    for (let i = 0; i <= rowLen; i++) {
      const minuend = columnObj[i] || defaultColWidth;
      if (restLeft - minuend > 0) {
        restLeft -= minuend;
        col++;
      } else {
        col += restLeft / minuend;
        break;
      }
    }

    for (let i = 0; i <= columnLen; i++) {
      const minuend = rowObj[i] || defaultRowHeight;
      if (restTop - minuend > 0) {
        restTop -= minuend;
        row++;
      } else {
        row += restTop / minuend;
        break;
      }
    }

    if (col === 0) col = left / defaultColWidth; // 如果不存在自定义列和隐藏列, 设置列默认值

    if (row === 0) row = top / defaultRowHeight; // 如果不存在自定义行和隐藏行, 设置行默认值

    const imageId = workbook.addImage({ base64: src, extension: "png" });
    worksheet.addImage(imageId, { tl: { col, row }, ext: { width, height }, editAs: "absolute" });
  }

  return worksheet;
};

/**
 * 处理边框: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E8%BE%B9%E6%A1%86
 * @param worksheet 工作表
 * @param borderInfo 边框信息
 */
const handleBorder = (worksheet: Worksheet, borderInfo: any[] = []) => {
  if (!borderInfo) return worksheet;

  borderInfo?.forEach((border) => {
    let realBorder = {} as Partial<Borders>;
    const { row, column } = border?.range?.[0] || {};

    const style = getValueByKey(borderStyleMap, border?.style) as BorderStyle;

    switch (border?.borderType) {
      case "border-left" /* 左框线 */:
      case "border-right" /* 右框线 */:
      case "border-top" /* 上框线 */:
      case "border-bottom" /* 下框线 */: {
        const key = border?.borderType?.slice?.(7);
        const currentCell = worksheet.getCell(row?.[0] + 1, column?.[0] + 1);
        currentCell.border = { ...currentCell.border, [key]: { style, color: { argb: handleColorToARGB(border?.color) } } };
        break;
      }
      case "border-none" /* 无 */:
      case "border-all" /* 所有 */: {
        const borderObj = { style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;
        realBorder = { top: borderObj, left: borderObj, bottom: borderObj, right: borderObj };
        for (let i = row?.[0]; i <= row?.[1]; i++) {
          for (let j = column?.[0]; j <= column?.[1]; j++) {
            worksheet.getCell(i + 1, j + 1).border = realBorder;
          }
        }
        break;
      }
      case "border-inside" /* 内侧 */: {
        const borderObj = { style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;

        // 内侧横线的范围，从 row[0] + 1 到 row[1] - 1 行，从 column[0] 到 column[1] 列
        for (let i = row?.[0] + 1; i <= row?.[1] - 1; i++) {
          for (let j = column?.[0]; j <= column?.[1]; j++) {
            const cell = worksheet.getCell(i + 1, j + 1);
            cell.border = { top: borderObj, bottom: borderObj };
          }
        }

        // 内侧竖线的范围，从 row[0] 到 row[1] 行，从 column[0] + 1 到 column[1] - 1 列
        for (let i = row?.[0]; i <= row?.[1]; i++) {
          for (let j = column?.[0] + 1; j <= column?.[1] - 1; j++) {
            const cell = worksheet.getCell(i + 1, j + 1);
            cell.border = { ...cell.border, left: borderObj, right: borderObj };
          }
        }

        break;
      }
      case "border-outside" /* 外侧 */: {
        const borderObj = { style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;
        // 外侧边框的范围，从 row[0] 到 row[1] 行，从 column[0] 到 column[1] 列
        for (let i = row?.[0]; i <= row?.[1]; i++) {
          for (let j = column?.[0]; j <= column?.[1]; j++) {
            // 设置外侧边框，仅设置最外侧一圈
            if (i === row[0] || i === row[1] || j === column[0] || j === column[1]) {
              const cell = worksheet.getCell(i + 1, j + 1);
              cell.border = {
                top: i === row[0] ? borderObj : undefined,
                bottom: i === row[1] ? borderObj : undefined,
                left: j === column[0] ? borderObj : undefined,
                right: j === column[1] ? borderObj : undefined,
              };
            }
          }
        }
        break;
      }
      case "border-horizontal" /* 内侧横线 */: {
        const borderObj = { style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;
        // 内侧横线的范围，从 row[0] + 1 到 row[1] - 1 行，从 column[0] 到 column[1] 列
        for (let i = row?.[0] + 1; i <= row?.[1] - 1; i++) {
          for (let j = column?.[0]; j <= column?.[1]; j++) {
            const cell = worksheet.getCell(i + 1, j + 1);
            cell.border = { top: borderObj, bottom: borderObj };
          }
        }
        break;
      }
      case "border-vertical" /* 内侧竖线 */: {
        const borderObj = { style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;
        // 内侧竖线的范围，从 row[0] 到 row[1] 行，从 column[0] + 1 到 column[1] - 1 列
        for (let i = row?.[0]; i <= row?.[1]; i++) {
          for (let j = column?.[0] + 1; j <= column?.[1] - 1; j++) {
            const cell = worksheet.getCell(i + 1, j + 1);
            cell.border = { left: borderObj, right: borderObj };
          }
        }
        break;
      }
      case "border-slash" /* 边框斜线 */: {
        const borderObj = { up: false, down: true, style, color: { argb: handleColorToARGB(border?.color) } } as Partial<Border>;
        for (let i = row?.[0]; i <= row?.[1]; i++) {
          for (let j = column?.[0]; j <= column?.[1]; j++) {
            const cell = worksheet.getCell(i + 1, j + 1);
            cell.border = { diagonal: borderObj };
          }
        }
        break;
      }
      default:
        break;
    }
  });

  return worksheet;
};

/**
 * 处理冻结视图: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%86%BB%E7%BB%93%E8%A7%86%E5%9B%BE
 * @param worksheet Worksheet 工作表
 * @param frozen Sheet["frozen"] 冻结视图
 */
const handleFrozen = (worksheet: Worksheet, frozen: Sheet["frozen"]): Worksheet["views"] => {
  if (frozen) {
    const { type, range } = frozen;
    const column_focus = Number(range?.column_focus || -1) + 1;
    const row_focus = Number(range?.row_focus || -1) + 1;
    const otherView: Partial<WorksheetView> = worksheet.views[0];

    switch (type) {
      case "rangeColumn":
        return [{ ...otherView, state: "frozen", xSplit: column_focus, ySplit: 0, style: undefined }];
      case "rangeRow":
        return [{ ...otherView, state: "frozen", xSplit: 0, ySplit: row_focus, style: undefined }];
      case "both":
        return [{ ...otherView, state: "frozen", xSplit: column_focus, ySplit: row_focus, style: undefined }];
      default:
        return worksheet.views;
    }
  } else {
    return worksheet.views;
  }
};

/**
 * 处理自动筛选器: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E8%87%AA%E5%8A%A8%E7%AD%9B%E9%80%89%E5%99%A8
 * - excelJs 没有 filter 参数
 * @param filter_select 自动筛选器
 */
const handleAutoFilter = (filter_select: Sheet["filter_select"]): Worksheet["autoFilter"] => {
  if (filter_select && Object.keys(filter_select).length > 0) {
    const { row, column } = filter_select;
    return {
      from: { row: row[0], column: column[0] },
      to: { row: row[1], column: column[1] },
    };
  } else {
    return undefined;
  }
};

/**
 * 处理公式值: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%85%AC%E5%BC%8F%E5%80%BC
 * @param f 公式
 * @param v 值
 */
const handleFormula = (f: string, v: string | number | boolean | undefined) => {
  return { formula: f, result: v };
};

/**
 * 处理超链接: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E8%B6%85%E9%93%BE%E6%8E%A5%E5%80%BC
 * @param hyperlink 超链接
 * @param r 行
 * @param c 列
 * @param v 真实值
 */
const handleHyperlink = (hyperlink: Sheet["hyperlink"], r: number, c: number, v: any): CellValue => {
  const hl = hyperlink?.[r + "_" + c];

  switch (hl?.linkType) {
    case "webpage" /** 网页跳转 */:
      return { text: v, hyperlink: hl?.linkAddress, tooltip: hl?.linkAddress };
    case "cellrange" /** 文件内跳转 */:
      return { text: v, hyperlink: handleConvertReference(hl?.linkAddress) };
    case "sheet" /** 工作表跳转 */:
      return { text: v, hyperlink: handleConvertReference(hl?.linkAddress + "!A1") };
  }
};

/**
 * 处理正常值
 * @param ct 单元格类型
 * @param m 显示值
 */
const handleNormalValue = (ct: Cell["ct"], m: any) => {
  // 对数字类型的值特殊处理
  return ct?.fa === "General" && ct?.t === "n" ? Number(m) : m || null;
};

/**
 * 处理数字格式: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%95%B0%E5%AD%97%E6%A0%BC%E5%BC%8F
 * @param ct 单元格类型
 */
const handleNumFmt = (ct: Cell["ct"]) => {
  return ct?.fa || "";
};

/**
 * 处理字体: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%AD%97%E4%BD%93
 * @param cell 单元格
 */
const handleFont = (cell: Cell): Partial<Font> => {
  const { ff, fs, bl, it, un, cl, fc } = cell;

  return {
    // @ts-ignore
    name: ff,
    size: fs || 10,
    bold: bl === 1, // 加粗
    italic: it === 1, // 斜体
    underline: un === 1, // 下划线
    strike: cl === 1, // 删除线
    color: { argb: handleColorToARGB(fc!, "FF000000") }, // 颜色
  };
};

/**
 * 处理背景色: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%A1%AB%E5%85%85
 * @param bg 背景色
 */
const handleBackground = (bg: string): Fill => {
  return { type: "pattern", pattern: "solid", fgColor: { argb: handleColorToARGB(bg, "FFFFFFFF") } };
};

/**
 * 处理对齐方式: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%AF%B9%E9%BD%90
 * @param cell 单元格
 */
const handleAlignment = (cell: Cell): Partial<Alignment> => {
  const { vt, ht, tb, rt } = cell;

  const alignment: Partial<Alignment> = {
    vertical: undefined,
    horizontal: "left",
    textRotation: 0,
  };

  switch (tb + "") {
    case "0" /* 截断 */:
      alignment.horizontal = "fill";
      break;
    case "1" /* 溢出 */:
    case "2" /* 自动换行 */:
      alignment.wrapText = getValueByKey(wrapTextMap, vt + "");
      break;
  }

  alignment.vertical = getValueByKey(verticalAlignmentMap, vt + ""); // 垂直对齐

  alignment.horizontal = getValueByKey(horizontalAlignmentMap, ht + ""); // 水平对齐

  alignment.textRotation = getValueByKey(textRotationMap, rt + ""); // 文本角度

  return alignment;
};

/**
 * 处理合并单元格: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%90%88%E5%B9%B6%E5%8D%95%E5%85%83%E6%A0%BC
 * @param worksheet  工作表
 * @param merge 合并单元格信息
 * @param r 行
 * @param c 列
 */
const handleMergeCells = (worksheet: Worksheet, merge: SheetConfig["merge"], r: number, c: number) => {
  const mergeObj = merge?.[r + "_" + c];
  if (mergeObj) {
    const { r: merge_r, c: merge_c, rs: merge_rs, cs: merge_cs } = mergeObj;
    worksheet.mergeCells(merge_r + 1, merge_c + 1, merge_r + merge_rs, merge_c + merge_cs);
  }

  return worksheet;
};

/**
 * 处理注释/批注: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%8D%95%E5%85%83%E6%A0%BC%E6%B3%A8%E9%87%8A
 * @param ps 批注
 */
const handleNote = (ps: Cell["ps"]): string | CellModel["comment"] => {
  // exceljs 不支持注释换行 x.x
  const texts = ps?.value?.split("<br>").map((_) => ({ text: _ }));
  return { texts: texts, editAs: "twoCells" };
};

/**
 * 数据验证: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E6%95%B0%E6%8D%AE%E9%AA%8C%E8%AF%81
 * @param dataVerification 数据验证
 * @param r 行
 * @param c 列
 * @param v 值
 */
const handleDataValidation = (dataVerification: Sheet["dataVerification"], r: number, c: number): DataValidation => {
  const dv = dataVerification?.[r + "_" + c];

  switch (dv?.type) {
    case "dropdown" /* 下拉框 */: {
      return {
        type: "list",
        formulae: [`"${dv?.value1}"`],
        allowBlank: true,
        showInputMessage: dv?.hintShow,
        // promptTitle: "提示",
        prompt: dv?.hintValue,
        showErrorMessage: dv?.prohibitInput,
        // errorTitle: "错误",
        error: "你选择的不是下拉列表中的选项",
      };
    }
    case "number_integer" /* 整数 */: {
      const tip = handleOperator(dv?.type2, dv?.value1, dv?.value2);

      return {
        type: "whole",
        operator: dv?.type2,
        formulae: [Number(dv?.value1), Number(dv?.value2)],
        allowBlank: true,
        showInputMessage: dv?.hintShow,
        prompt: dv?.hintValue,
        showErrorMessage: dv?.prohibitInput,
        error: `你输入的不是${tip}的整数`,
      };
    }
    case "number_decimal" /* 小数 */: {
      const tip = handleOperator(dv?.type2, dv?.value1, dv?.value2);

      return {
        type: "decimal",
        operator: dv?.type2,
        formulae: [Number(dv?.value1), Number(dv?.value2)],
        allowBlank: true,
        showInputMessage: dv?.hintShow,
        prompt: dv?.hintValue,
        showErrorMessage: dv?.prohibitInput,
        error: `你输入的不是${tip}的小数`,
      };
    }
    case "text_length" /* 文本长度 */: {
      const tip = handleOperator(dv?.type2, dv?.value1, dv?.value2);

      return {
        type: "textLength",
        operator: dv?.type2,
        formulae: [Number(dv?.value1), Number(dv?.value2)],
        allowBlank: true,
        showInputMessage: dv?.hintShow,
        prompt: dv?.hintValue,
        showErrorMessage: dv?.prohibitInput,
        error: `你输入的不是长度${tip}的文本`,
      };
    }
    case "date" /* 日期 */: {
      const tip = handleOperator(dv?.type2, dv?.value1, dv?.value2);

      return {
        type: "date",
        operator: dv?.type2,
        formulae: [new Date(dv?.value1), new Date(dv?.value2)],
        allowBlank: true,
        showInputMessage: dv?.hintShow,
        prompt: dv?.hintValue,
        showErrorMessage: dv?.prohibitInput,
        error: `你输入的不是${tip}的日期`,
      };
    }
    case "number" /* 数字 */:
    case "text_content" /** 文本内容 */:
    case "validity" /* 有效性 */:
    case "checkbox" /* 复选框 */:
    default:
      // 这里处理的都是 exceljs 不支持的类型 - x.x
      return { type: "custom", formulae: [], allowBlank: true };
  }
};

/**
 * 下载Excel
 * @param workbook ExcelJS.Workbook
 * @param fileName 文件名
 */
export const handleDownloadExcel = async (workbook: Workbook, fileName: string = "temp.xlsx") => {
  // 将工作簿转换为二进制数据
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);

  // 创建一个 a 标签
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();

  // 释放资源
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

/**
 * 导出Excel
 * - 问题1: 列宽和行高改变时会影响图片的位置
 * - 问题2: excelJs 没有 filter 参数
 * @param workbookData 工作簿数据
 * @param fileName 文件名
 */
export const handleExportExcel = async (workbookData: Sheet[], fileName: string) => {
  // 创建一个工作簿
  const workbook = new ExcelJS.Workbook();

  // 工作表排序
  const newWorkbookData = [...workbookData]?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  newWorkbookData.map((sheetData) => {
    const { name, hide, zoomRatio = 1, data, config, frozen, filter_select, dataVerification, hyperlink }: Sheet = sheetData!;

    let worksheet = workbook.addWorksheet(name, {
      // 工作表隐藏: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%B7%A5%E4%BD%9C%E8%A1%A8%E7%8A%B6%E6%80%81
      state: hide === 1 ? "hidden" : "visible",
      // 视图百分比: https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%B7%A5%E4%BD%9C%E8%A1%A8%E8%A7%86%E5%9B%BE
      views: [{ zoomScale: zoomRatio * 100 }],
      properties: {
        /**
         * 列宽是自动计算的, 行高是15
         * https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%B7%A5%E4%BD%9C%E8%A1%A8%E5%B1%9E%E6%80%A7
         */
        defaultColWidth: excelColWidth,
        defaultRowHeight: excelRowHeight,
      },
    });

    // 处理行高、列宽、隐藏行、隐藏列
    worksheet = handleColumnRowLen(worksheet, config);

    // 处理图片
    worksheet = handleImages(workbook, worksheet, sheetData);

    // 处理边框
    worksheet = handleBorder(worksheet, config?.borderInfo);

    // 处理冻结视图
    worksheet.views = handleFrozen(worksheet, frozen);

    // 处理筛选器
    worksheet.autoFilter = handleAutoFilter(filter_select);

    // 处理数据
    data?.forEach((row, r) => {
      const newRow = row.map((cell, c) => {
        if (!cell) return null;

        const { f, m, v, ct, hl, bg, ps } = cell; // 单元格

        const currentCell = worksheet.getCell(r + 1, c + 1); // 获取单元格

        // currentCell.model.type = 1; // 默认类型
        // currentCell.model.text = m ? m + "" : undefined; // 默认文本
        // currentCell.model.value = v; // 默认值

        if (f) currentCell.value = handleFormula(f, v); // 公式值
        else if (hl) currentCell.value = handleHyperlink(hyperlink, r, c, v); // 超链接
        else currentCell.value = handleNormalValue(ct, m); // 正常值

        if (ct) currentCell.numFmt = handleNumFmt(ct); // 数字格式

        if (cell) currentCell.font = handleFont(cell); // 字体

        if (bg) currentCell.fill = handleBackground(bg); // 背景色

        if (cell) currentCell.alignment = handleAlignment(cell); // 对齐方式

        if (ps) currentCell.note = handleNote(ps); // 注释

        if (dataVerification) currentCell.dataValidation = handleDataValidation(dataVerification, r, c); // 数据验证

        if (config?.merge) worksheet = handleMergeCells(worksheet, config?.merge, r, c); // 合并单元格
      });

      worksheet.addRow(newRow);
    });
  });

  // 下载Excel
  await handleDownloadExcel(workbook, fileName);
};
