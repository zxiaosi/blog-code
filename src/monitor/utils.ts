import { createStore } from 'idb-keyval';

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

/** 获取数据的大小 */
export const getSizeUtil = (data: any) => {
  const newData = typeof data === 'string' ? JSON.parse(data) : data;
  return new Blob([newData]).size || 0;
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
