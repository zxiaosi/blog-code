import ExcelJS, { Worksheet } from "exceljs";
import { Cell, CellWithRowAndCol, Sheet, SheetConfig } from "@fortune-sheet/core";
import { handleArgbToHex, handleCellToRowCol, handleMaxValue } from "./tool";
import { borderStyleMap, getKeyByValue, horizontalAlignmentMap, textRotationMap, wrapTextMap } from "./enum";

/** excel 默认列宽 */
const excelColWidth = 8.43;

/** excel 默认行高 */
const excelRowHeight = 15;
// const excelRowHeight = 14.25;

/** fortune-sheet 默认列宽 */
const defaultColWidth = 73;

/** fortune-sheet 默认行高 */
const defaultRowHeight = 19;

/** fortune-sheet 默认行数 */
const defaultRows = 36;

/** fortune-sheet 默认列数 */
const defaultColumns = 18;

/**
 * 导入Excel
 * - 问题1: 列宽和行高改变时会影响图片的位置
 * - 问题2: excelJS 获取不到工作表内的超链接
 * - 问题3: fortune-sheet 数字格式(百分比、货币等)不生效
 * - 问题4: fortune-sheet 斜线边框方法不生效
 * @param file 文件
 */
export const handleImportExcel = async (file: File) => {
  try {
    // 初始化数据
    const excelData: Sheet[] = [];

    // 读取Excel文件
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    const worksheets = await workbook.xlsx.load(buffer);

    // 遍历所有的工作表
    worksheets.eachSheet((worksheet: Worksheet) => {
      const { name, rowCount, columnCount, state, views, autoFilter } = worksheet;

      // 声明变量
      let frozen = {} as Sheet["frozen"]; // 冻结区域
      const filter_select = {} as { row: number[]; column: number[] }; // 筛选
      const config = {} as SheetConfig; // 配置
      const images = [] as Sheet["images"]; // 图片
      const hyperlink = {} as Record<string, { linkType: string; linkAddress: string }>; // 超链接
      const calcChain = [] as Sheet["calcChain"]; // 公式链
      const dataVerification = {} as any; // 数据验证
      const celldata = [] as CellWithRowAndCol[]; // 单元格数据

      // 最大行数和列数
      const maxRow = handleMaxValue(rowCount, defaultRows);
      const maxCol = handleMaxValue(columnCount, defaultColumns);

      // 是否隐藏
      const hide = state === "visible" ? 0 : 1;

      // 缩放比例
      const zoomRatio = (views[0]?.zoomScale || 100) / 100;

      // 冻结区域 - 控制台会报错: https://github.com/ruilisi/fortune-sheet/issues/434
      if (views[0].state === "frozen") {
        const { xSplit = 0, ySplit = 0 } = views[0]; // 选中区域
        if (xSplit > 0 && ySplit > 0) {
          frozen = { type: "both", range: { row_focus: ySplit - 1, column_focus: xSplit - 1 } };
        } else if (xSplit === 0) {
          frozen = { type: "rangeRow", range: { row_focus: ySplit - 1, column_focus: 0 } };
        } else if (ySplit > 0) {
          frozen = { type: "rangeColumn", range: { row_focus: 0, column_focus: xSplit - 1 } };
        }
      }

      // 自动筛选器
      if (autoFilter) {
        filter_select.row = [autoFilter.from.row, autoFilter.to.row];
        filter_select.column = [autoFilter.from.col, autoFilter.to.col];
      }

      // 处理列宽、隐藏列
      for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
        const curCol = worksheet.getColumn(colNumber);
        if (curCol.width) {
          if (config.columnlen === undefined) config.columnlen = {};
          config.columnlen[colNumber - 1] = curCol.width * (defaultColWidth / excelColWidth);
        }

        if (curCol.hidden) {
          if (config.colhidden === undefined) config.colhidden = {};
          config.colhidden[colNumber - 1] = 0;
        }
      }

      // 处理行高、隐藏行
      for (let rowNumber = 1; rowNumber <= maxRow; rowNumber++) {
        const curRow = worksheet.getRow(rowNumber);
        if (curRow.height) {
          if (config.rowlen === undefined) config.rowlen = {};
          config.rowlen[rowNumber - 1] = curRow.height * (defaultRowHeight / excelRowHeight);
        }

        if (curRow.hidden) {
          if (config.rowhidden === undefined) config.rowhidden = {};
          config.rowhidden[rowNumber - 1] = 0;
        }
      }

      // 处理图片: excelJs 不会处理已变化单元格的宽度 https://github.com/exceljs/exceljs/issues/2730
      const sheetImages = worksheet.getImages();
      if (sheetImages && sheetImages.length > 0) {
        sheetImages.map((item) => {
          const { imageId, range } = item;

          // 获取图像的数据
          const image = workbook.getImage(Number(imageId));

          // 图片的base64
          const base64 = `data:${image.type}/${image.extension};base64,${image.buffer?.toString("base64")}`;

          // 获取图像的左上角和右下角的单元格位置
          const topLeftCell = range.tl;
          const bottomRightCell = range.br;

          // 获取单元格的行高和列宽，并计算图像的宽度和高度
          let realWidth = 0;
          let realHeight = 0;

          // 图片在单元格内
          if (Math.floor(topLeftCell.row) === Math.floor(bottomRightCell.row)) {
            const curRow = Math.floor(topLeftCell.row) + 1;
            const height = Number(worksheet.getRow(curRow).height || 0) * (defaultRowHeight / excelRowHeight) || defaultRowHeight;
            realHeight = height * (bottomRightCell.row - topLeftCell.row);
          } else {
            for (let row = Math.floor(topLeftCell.row); row < Math.floor(bottomRightCell.row) + 1; row++) {
              const height = worksheet.getRow(row).height * (defaultRowHeight / excelRowHeight) || defaultRowHeight;
              if (row < topLeftCell.row) {
                realHeight += height * (topLeftCell.row - row);
              } else if (row > bottomRightCell.row) {
                realHeight += height * (1 - (row - bottomRightCell.row));
              } else {
                realHeight += height;
              }
            }
          }

          if (Math.floor(topLeftCell.col) === Math.floor(bottomRightCell.col)) {
            const curCol = Math.floor(topLeftCell.col) + 1;
            const width = Number(worksheet?.getColumn(curCol)?.width || 0) * (defaultColWidth / excelColWidth) || defaultColWidth;
            realWidth = width * (bottomRightCell.col - topLeftCell.col);
          } else {
            for (let col = topLeftCell.col; col < bottomRightCell.col; col++) {
              const width = Number(worksheet?.getColumn(col)?.width || 0) * (defaultColWidth / excelColWidth) || defaultColWidth;
              if (col < topLeftCell.col) {
                realWidth += width * (topLeftCell.col - col);
              } else if (col > bottomRightCell.col) {
                realWidth += width * (1 - (col - bottomRightCell.col));
              } else {
                realWidth += width;
              }
            }
          }

          let realLeft = 0; // 计算图像的左边距
          let realTop = 0; // 计算图像的上边距
          for (let col = 1; col < topLeftCell.col + 1; col++) {
            const left = Number(worksheet?.getColumn(col)?.width || 0) * (defaultColWidth / excelColWidth) || defaultColWidth;
            if (col < topLeftCell.col) {
              realLeft += left;
            } else {
              realLeft += left * (1 - (col - topLeftCell.col));
            }
          }
          for (let row = 1; row < topLeftCell.row + 1; row++) {
            const top = worksheet.getRow(row).height * (defaultRowHeight / excelRowHeight) || defaultRowHeight;
            if (row < topLeftCell.row) {
              realTop += top;
            } else {
              realTop += top * (1 - (row - topLeftCell.row));
            }
          }

          images?.push({
            id: imageId,
            src: base64,
            width: realWidth,
            height: realHeight,
            left: realLeft,
            top: realTop,
          });
        });
      }

      // 设置单元格
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (cell.type !== 0) console.log("cell", cell.model);

          const currentCell = {} as CellWithRowAndCol;
          currentCell.r = Number(rowNumber) - 1;
          currentCell.c = Number(colNumber) - 1;
          currentCell.v = {} as Cell;

          const { type, value, font, formula, result, numFmt, alignment, fill, note, dataValidation, border } = cell;

          switch (type) {
            case 0 /** Null */:
              currentCell.v.v = null;
              break;
            case 1 /** Merge */: {
              // 起始点
              const { row: start_r, col: start_c } = handleCellToRowCol(cell.model.master);
              // 当前点
              const { row: end_r, col: end_c } = handleCellToRowCol(cell.address);

              // 合并单元格 - 1.设置mc
              const mc = { r: start_r - 1, c: start_c - 1 };
              currentCell.v.mc = mc;

              // 合并单元格 - 2.设置merge
              const merge = { r: start_r - 1, c: start_c - 1, rs: end_r - start_r + 1, cs: end_c - start_c + 1 };
              config.merge = { ...config.merge, [`${start_r - 1}_${start_c - 1}`]: merge };

              break;
            }
            case 2 /** Number */:
              currentCell.v.ht = 2; // 右对齐
              currentCell.v.v = value + "";
              currentCell.v.ct = { fa: numFmt || "General", t: "n" };
              break;
            case 3 /** String */:
              currentCell.v.v = value + "";
              currentCell.v.ct = { fa: "General", t: "s" };
              break;
            case 4 /** Date */:
              currentCell.v.ct = { fa: numFmt || "General", t: "d" };
              break;
            case 5 /** Hyperlink */:
              currentCell.v.v = value?.text;
              hyperlink[`${currentCell.r}_${currentCell.c}`] = {
                linkType: "webpage",
                linkAddress: value?.hyperlink,
              };
              break;
            case 6 /** Formula */:
              currentCell.v.ht = 2; // 右对齐
              currentCell.v.f = "=" + formula;
              currentCell.v.v = result;
              currentCell.v.ct = { fa: "General", t: "n" };
              // 等待excel加载完成后, 手动计算公式 - ref.current?.calculateFormula();
              // calcChain?.push({ r: currentCell.r, c: currentCell.c });
              break;
          }

          // 边框
          if (border && Object.keys(border).length > 0) {
            if (config.borderInfo === undefined) config.borderInfo = [];

            const borderKeys = Object.keys(border) || [];
            if (borderKeys.includes("left")) {
              config.borderInfo?.push({
                rangeType: "range",
                borderType: "border-left",
                style: getKeyByValue(borderStyleMap, border.left?.style || "thin"),
                color: handleArgbToHex(border.left?.color?.argb || "FF000000"),
                range: [{ row: [rowNumber - 1, rowNumber - 1], column: [colNumber - 1, colNumber - 1] }],
              });
            }

            if (borderKeys.includes("right")) {
              config.borderInfo?.push({
                rangeType: "range",
                borderType: "border-right",
                style: getKeyByValue(borderStyleMap, border.right?.style || "thin"),
                color: handleArgbToHex(border.right?.color?.argb || "FF000000"),
                range: [{ row: [rowNumber - 1, rowNumber - 1], column: [colNumber - 1, colNumber - 1] }],
              });
            }

            if (borderKeys.includes("top")) {
              config.borderInfo?.push({
                rangeType: "range",
                borderType: "border-top",
                style: getKeyByValue(borderStyleMap, border.top?.style || "thin"),
                color: handleArgbToHex(border.top?.color?.argb || "FF000000"),
                range: [{ row: [rowNumber - 1, rowNumber - 1], column: [colNumber - 1, colNumber - 1] }],
              });
            }

            if (borderKeys.includes("bottom")) {
              config.borderInfo?.push({
                rangeType: "range",
                borderType: "border-bottom",
                style: getKeyByValue(borderStyleMap, border.bottom?.style || "thin"),
                color: handleArgbToHex(border.bottom?.color?.argb || "FF000000"),
                range: [{ row: [rowNumber - 1, rowNumber - 1], column: [colNumber - 1, colNumber - 1] }],
              });
            }

            // 斜线 fortune-sheet 不生效
            if (borderKeys.includes("diagonal")) {
              config.borderInfo?.push({
                rangeType: "range",
                borderType: "border-slash",
                style: getKeyByValue(borderStyleMap, border.diagonal?.style || "thin"),
                color: handleArgbToHex(border.diagonal?.color?.argb || "FF000000"),
                range: [{ row: [rowNumber - 1, rowNumber - 1], column: [colNumber - 1, colNumber - 1] }],
              });
            }
          }

          // 字体
          if (font) {
            if (font.name) currentCell.v.ff = font.name;
            if (font.size) currentCell.v.fs = font.size;
            if (font.bold) currentCell.v.bl = 1;
            if (font.italic) currentCell.v.it = 1;
            if (font.underline) currentCell.v.un = 1;
            if (font.strike) currentCell.v.cl = 1;
            if (font.color) currentCell.v.fc = handleArgbToHex(font.color.argb);
          }

          // 背景色
          if (fill && fill.type === "pattern") {
            currentCell.v.bg = handleArgbToHex(fill?.fgColor?.argb);
          }

          // 对齐方式
          if (alignment) {
            // 水平对齐
            if (alignment.horizontal) {
              switch (alignment.horizontal) {
                case "left" /* 左对齐 */:
                case "center" /* 居中对齐 */:
                case "right" /* 右对齐 */:
                  currentCell.v.ht = Number(getKeyByValue(horizontalAlignmentMap, alignment.horizontal));
                  break;
                case "fill" /* 截断 */:
                  currentCell.v.tb = "0";
                  break;
              }
            }

            // 垂直对齐
            if (alignment.vertical) {
              currentCell.v.vt = Number(getKeyByValue(horizontalAlignmentMap, alignment.vertical));
            }

            // 自动换行
            if (alignment.wrapText) {
              currentCell.v.tb = getKeyByValue(wrapTextMap, alignment.wrapText);
            }

            // 文本角度
            if (alignment.textRotation) {
              currentCell.v.rt = Number(getKeyByValue(textRotationMap, alignment.textRotation));
            }
          }

          // 注释
          if (note) {
            const noteVal = note?.texts ? note.texts.map((_) => _.text).join("") : note || null;
            currentCell.v.ps = {
              left: null,
              top: null,
              width: null,
              height: null,
              value: noteVal,
              isShow: false,
            };
          }

          // 数据验证
          if (dataValidation) {
            const { type, formulae, showInputMessage, prompt, showErrorMessage, operator } = dataValidation;
            switch (type) {
              case "list" /** 下拉列表 */:
                dataVerification[`${currentCell.r}_${currentCell.c}`] = {
                  type: "dropdown",
                  value1: JSON.parse(formulae?.[0]),
                  checked: false,
                  hintShow: showInputMessage,
                  hintValue: prompt,
                  prohibitInput: showErrorMessage,
                };
                break;
              case "whole" /** 整数 */:
                dataVerification[`${currentCell.r}_${currentCell.c}`] = {
                  type: "number_integer",
                  type2: operator,
                  value1: formulae?.[0] + "",
                  value2: formulae?.[1] + "",
                  hintShow: showInputMessage,
                  hintValue: prompt,
                  prohibitInput: showErrorMessage,
                };
                break;
              case "decimal" /** 小数 */:
                dataVerification[`${currentCell.r}_${currentCell.c}`] = {
                  type: "number_decimal",
                  type2: operator,
                  value1: formulae?.[0] + "",
                  value2: formulae?.[1] + "",
                  hintShow: showInputMessage,
                  hintValue: prompt,
                  prohibitInput: showErrorMessage,
                };
                break;
              case "textLength" /** 文本长度 */:
                dataVerification[`${currentCell.r}_${currentCell.c}`] = {
                  type: "text_length",
                  type2: operator,
                  value1: formulae?.[0] + "",
                  value2: formulae?.[1] + "",
                  hintShow: showInputMessage,
                  hintValue: prompt,
                  prohibitInput: showErrorMessage,
                };
                break;
              case "date" /** 日期 */:
                dataVerification[`${currentCell.r}_${currentCell.c}`] = {
                  type: "date",
                  type2: operator,
                  value1: formulae?.[0] + "",
                  value2: formulae?.[1] + "",
                  hintShow: showInputMessage,
                  hintValue: prompt,
                  prohibitInput: showErrorMessage,
                };
                break;
            }
          }

          celldata.push(currentCell);
        });
      });

      // 处理单元格
      const mergeKeys = Object.keys(config.merge || {});
      mergeKeys.forEach((key: any) => {
        const [r, c] = key.split("_");
        const cell = celldata.find((item) => item.r === Number(r) && item.c === Number(c)) as CellWithRowAndCol;
        cell.v.mc = config.merge?.[key];
        celldata.push(cell);
      });

      excelData.push({
        name,
        row: maxRow,
        column: maxCol,
        hide,
        zoomRatio,
        frozen,
        filter_select,
        config,
        images,
        hyperlink,
        calcChain,
        dataVerification,
        celldata,
      });
    });

    return excelData;
  } catch (e) {
    console.error("报错~", e);
    return false;
  }
};
