/** 边框样式枚举 */
export const borderStyleMap = {
  "1": "thin", // 细边框
  "2": "hair", // 虚线边框
  "3": "dotted", // 点状边框
  "4": "dashed", // 虚线边框
  "5": "dashDot", // 点划线边框
  "6": "dashDotDot", // 双点划线边框
  "7": "double", // 双边框
  "8": "medium", // 中等边框
  "9": "mediumDashed", // 中等虚线边框
  "10": "mediumDashDot", // 中等点划线边框
  "11": "mediumDashDotDot", // 中等双点划线边框
  "12": "slantDashDot", // 斜线点划线边框
  "13": "thick", // 粗边框
};

/** 水平对齐枚举 */
export const verticalAlignmentMap = {
  "0": "middle", // 居中对齐
  "1": "top", // 顶部对齐
  "2": "bottom", // 底部对齐
};

/** 垂直对齐枚举 */
export const horizontalAlignmentMap = {
  "0": "center", // 居中对齐
  "1": "left", // 左对齐
  "2": "right", // 右对齐
};

/** 文本换行枚举 */
export const wrapTextMap = {
  "1": false, // 溢出
  "2": true, // 自动换行
};

/** 文本角度枚举 */
export const textRotationMap = {
  "1": 45, // 向上倾斜
  "2": -45, // 向下倾斜
  "3": "vertical", // 竖排文字
  "4": 90, // 向上90°
  "5": -90, // 向下90°
};

/**
 * 根据key获取value
 * @param map 枚举对象
 * @param key 枚举key
 */
export function getValueByKey(map: Record<string, any>, key: any): any {
  return map[key];
}

/**
 * 据value获取key
 * @param map 枚举对象
 * @param value 枚举value
 */
export function getKeyByValue(map: Record<string, any>, value: any): any {
  return Object.keys(map).find((key) => map[key] === value);
}
