import { CUSTOM_STORAGE } from '@/monitor/utils';
import { values } from 'idb-keyval';
import { create } from 'zustand';

interface UseLogData {
  /** 加载中 */
  loading: boolean;
  /** 数据 */
  data: any;
  /** 获取数据 */
  getData: () => Promise<void>;
}

/** 日志数据 */
const useLogData = create<UseLogData>((set, get) => ({
  loading: false,
  data: [],
  getData: async () => {
    set(() => ({ loading: true }));

    const resp = (await values(CUSTOM_STORAGE)) || [];
    console.log('resp', resp);

    set(() => ({ data: {}, loading: false }));
  },
}));

export { useLogData };
