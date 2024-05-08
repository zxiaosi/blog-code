/** 将单元格坐标转为对应的行列索引 */
export const handleCellToRowCol = (cell: string) => {
  // 将字母部分转换为大写
  const colIndex = cell.substring(0, 1).toUpperCase();
  // 提取数字部分并转换为数字
  const row = parseInt(cell.substring(1));
  // 将列转换为从 1 开始的数字，A 对应 1，B 对应 2，依此类推
  const col = colIndex.charCodeAt(0) - "A".charCodeAt(0) + 1;
  return { row, col };
};

/**
 * 转换内部链接引用
 * @param reference - 内部链接引用
 */
export const handleConvertReference = (reference: string) => {
  // 使用正则表达式分隔工作表名称和单元格范围
  const regex = /^(.*)!(.*)$/;
  const match = reference.match(regex);

  if (match) {
    let sheetName = match[1];
    const cellRange = match[2];

    // 检查工作表名称是否已经用单引号包裹
    if (!sheetName.startsWith("'")) {
      sheetName = `${sheetName}`;
    }

    // 在原始引用前添加 #
    const convertedReference = cellRange ? `#${sheetName}!${cellRange}` : `#${sheetName}`;

    return convertedReference;
  } else {
    // 如果输入格式不正确，返回原始引用
    return reference;
  }
};

/**
 * 将 ARGB 颜色值转换为 RGB 格式
 */
function handleRgbToHex(r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 将 RGB 颜色值转换为 ARGB 格式
 */
export function handleColorToARGB(color: string, defaultColor?: string) {
  if (!color) return defaultColor || undefined;

  let hex = "";

  // 如果颜色值是十六进制格式
  if (color?.startsWith("#")) {
    hex = color?.slice(1);
  }
  // 如果颜色值是 RGB 格式
  else if (color?.startsWith("rgb")) {
    const rgbValues = color?.match(/\d+/g);
    hex = handleRgbToHex(Number(rgbValues?.[0]), Number(rgbValues?.[1]), Number(rgbValues?.[2]));
  }

  // 补全颜色值长度为 6 位
  if (hex?.length === 3) {
    hex = hex.replace(/(.)/g, "$1$1");
  }

  // 将 ARGB 值返回
  return "FF" + hex?.toUpperCase();
}

/**
 * 将 ARGB 颜色值转换为 RGB 格式
 */
export function handleArgbToHex(argb?: string) {
  if (!argb) return undefined;
  return argb.replace("FF", "#");
}

/**
 * 处理类型
 * @param type 类型
 * @param v1 计算值1
 * @param v2 计算值2
 */
export const handleOperator = (type: string, v1?: any, v2?: any) => {
  switch (type) {
    case "between":
      return `介于${v1}和${v2}之间`;
    case "notBetween":
      return `不介于${v1}和${v2}之间`;
    case "equal":
      return `等于${v1}`;
    case "notEqual":
      return `不等于${v1}`;
    case "greaterThan":
      return `大于${v1}`;
    case "lessThan":
      return `小于${v1}`;
    case "greaterThanOrEqual":
      return `大于等于${v1}`;
    case "lessThanOrEqual":
      return `小于等于${v1}`;
    default:
      return "";
  }
};

/** 获取最大值 */
export const handleMaxValue = (...numbers: any[]) => {
  const filteredNumbers = numbers.filter((num) => typeof num === "number");
  if (filteredNumbers.length === 0) return 0; // 没有有效的数值参数
  return Math.max(...filteredNumbers);
};
