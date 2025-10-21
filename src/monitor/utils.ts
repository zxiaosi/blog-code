import { clear, createStore, delMany, set, values } from 'idb-keyval';

export interface LogData {
  content: any;
  size: number;
  createTime: number;
  expiredTime: number;
}

/** 数据库名 */
export const DB_NAME = 'monitor';

/** 表名 */
export const TABLE_NAME = 'log_db';

/** 自定义存储 */
export const CUSTOM_STORAGE = createStore(DB_NAME, TABLE_NAME);

/** 过期时间 */
export const EXPIRED_THRESHOLD = 1000 * 60 * 60 * 24 * 7; // 7天

/** 最大容量 */
export const MAX_SIZE = 1024 * 1024 * 20; // 20MB 最大容量

/** 导出数据 */
export const exportDataUtil = async () => {
  // 获取所有数据
  const data = (await values(CUSTOM_STORAGE)) || [];

  // 下载数据
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'log.json';
  a.click();
  URL.revokeObjectURL(url);
};

/** 清除数据 */
export const clearDataUtil = async () => {
  await clear(CUSTOM_STORAGE);
};

/**
 * 检查过期数据
 * @param allData 所有数据
 * @param expiredTime 过期时间
 */
export const checkExpiredDataUtil = (allData: LogData[], expiredTime: number = Date.now()) => {
  const expired = [] as LogData[];
  const unExpired = [] as LogData[];

  allData.forEach((log) => {
    if (log.expiredTime > expiredTime) unExpired.push(log);
    else expired.push(log);
  });

  return { expired, unExpired };
};

/**
 * 判断容量是否超出限制
 * @param allData 所有数据
 * @param newItem 新项目
 */
export const checkCapacityUtil = (allData: LogData[], newItem: LogData) => {
  const exceed = [] as LogData[];
  const unExceed = [...allData] as LogData[];

  // 添加新项目
  unExceed.push(newItem);

  // 计算当前总和
  let sum = unExceed.reduce((prev, curr) => prev + curr.size, 0);

  // 从头部删除元素直到总和<=maxSum
  while (sum > MAX_SIZE && unExceed.length > 0) {
    const removed = unExceed.shift() as LogData;
    sum -= removed.size;
    exceed.push(removed);
  }

  return { exceed, unExceed, sum };
};

/**
 * 写入数据
 * @param data 数据
 */
export const writeDataUtil = async (data: any) => {
  // 1. 获取当前时间戳
  const currentDate = Date.now();

  // 2. 生成新数据
  const newData = typeof data === 'string' ? data : JSON.stringify(data);
  const logData: LogData = {
    content: newData,
    size: new Blob([newData]).size || 0,
    createTime: currentDate,
    expiredTime: currentDate + EXPIRED_THRESHOLD, // 7天过期
  };

  // 3. 获取所有数据
  const allData: LogData[] = (await values(CUSTOM_STORAGE)) || [];

  // 4. 检查过期和超出容量的数据
  const { expired, unExpired } = checkExpiredDataUtil(allData, currentDate);
  const { exceed, unExceed, sum } = checkCapacityUtil(unExpired, logData);
  const deletedArr = [...expired, ...exceed]; // 待删除数据
  const ids = deletedArr.map((item) => item.createTime + '');
  await delMany(ids, CUSTOM_STORAGE);

  // 5. 存储新数据
  await set(currentDate + '', logData, CUSTOM_STORAGE);
};
