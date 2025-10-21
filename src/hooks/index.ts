import { CUSTOM_STORAGE, LogData } from '@/monitor/utils';
import { values } from 'idb-keyval';
import { create } from 'zustand';

interface Data {
  /** 性能数据 */
  performanceList: any[];
  /** 错误数据 */
  errorList: any[];
  /** 录屏数据 */
  recordScreenList: any[];
  /** 白屏检测数据 */
  whiteScreenList: any[];
}

interface UseLogData {
  /** 加载中 */
  loading: boolean;
  /** 大小 */
  size: number;
  /** 数据 */
  data: Partial<Data>;
  /** 获取数据 */
  getData: () => Promise<void>;
}

/** 日志数据 */
const useLogData = create<UseLogData>((set, get) => ({
  loading: false,
  size: 0,
  data: {},
  getData: async () => {
    set(() => ({ loading: true }));

    let newSize = 0;
    const newData: Data = {
      performanceList: [],
      errorList: [],
      recordScreenList: [],
      whiteScreenList: [],
    };

    const resp: LogData[] = (await values(CUSTOM_STORAGE)) || [];
    resp.forEach((item) => {
      newSize += item.size;
      const contentObj = JSON.parse(item?.content || '{}');
      switch (contentObj.type) {
        case 'performance':
          newData.performanceList.push(contentObj);
          break;
        case 'recordScreen':
          newData.recordScreenList.push(contentObj);
          break;
        case 'whiteScreen':
          newData.whiteScreenList.push(contentObj);
          break;
        default:
          newData.errorList.push(contentObj);
          break;
      }
    });

    set(() => ({ data: newData, size: newSize, loading: false }));
  },
}));

export { useLogData };
