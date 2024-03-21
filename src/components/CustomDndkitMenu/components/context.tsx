import { createContext, useState } from 'react';
import { generateMenuItems } from './utils';

interface CreateDataApi {
  /** 名称 */
  name: string;
  /** 父节点id */
  parentId: number;
}

interface UpdateDataApi extends Partial<CreateDataApi> {
  /** 拖拽节点id */
  id: number;
}

interface DragDataApi {
  /** 父节点id */
  parentId: number;
  /** 排序后的ids */
  ids: number[];
}

/** 假数据 */
const listData = [
  { id: 1, name: '测试1', parentId: -1, idx: 1 },
  { id: 2, name: '测试2', parentId: -1, idx: 2 },
  { id: 3, name: '测试3', parentId: 2, idx: 1 },
  { id: 4, name: '测试4', parentId: -1, idx: 3 },
  { id: 5, name: '测试5', parentId: 4, idx: 1 },
  { id: 6, name: '测试6', parentId: 5, idx: 1 },
];

export interface ApisContentProps {
  /** 子孩子 */
  children?: React.ReactNode;
}

export interface ApisContentReturnProps {
  /** 数据 */
  tableData?: any[];
  /** 获取数据列表 */
  getDatasApi?: () => any[];
  /** 创建数据 */
  createDataApi?: (data: CreateDataApi) => void;
  /** 更新数据 */
  updateDataApi?: (data: UpdateDataApi) => void;
  /** 拖拽数据 */
  dragDataApi?: (data: DragDataApi) => void;
  /** 删除数据 */
  deleteDataApi?: (id: number) => void;
}

/** 上下文 */
export const ApisContext = createContext<ApisContentReturnProps>({});

/** 模拟接口 */
export const MyApisContext = ({ children }: ApisContentProps) => {
  const [tableData, setTableData] = useState<any[]>(listData); // 表格数据

  /** 获取数据列表 */
  const getDatasApi = () => generateMenuItems(tableData, -1);

  /** 创建数据 */
  const createDataApi = (data: CreateDataApi) => {
    const { parentId, name } = data;
    // 改变数据的引用地址，触发组件更新
    const newTableData = [...tableData]; // 创建原数组的副本
    newTableData.push({ id: tableData.length + 1, name, parentId }); // 更新副本中指定索引位置的元素
    setTableData(newTableData); // 更新 state 中的数据
  };

  /** 更新数据 */
  const updateDataApi = (data: UpdateDataApi) => {
    const { name, id } = data;
    const index = tableData.findIndex((item) => item.id === id);
    if (index !== -1) {
      // 改变数据的引用地址，触发组件更新
      const newTableData = [...tableData]; // 创建原数组的副本
      newTableData[index] = { ...tableData[index], ...data, name }; // 更新副本中指定索引位置的元素
      setTableData(newTableData); // 更新 state 中的数据
    }
  };

  /** 拖拽数据 */
  const dragDataApi = (data: DragDataApi) => {
    const { parentId, ids } = data;

    const newTableData = tableData.map((item) => {
      const index = ids.findIndex((_) => _ === item.id);
      return index !== -1 ? { ...item, idx: index + 1, parentId } : item;
    });

    setTableData(newTableData);
  };

  /** 删除数据 */
  const deleteDataApi = (id: number) => {
    const index = tableData.findIndex((item) => item.id === id);
    if (index !== -1) {
      // 改变数据的引用地址，触发组件更新
      const newTableData = [...tableData]; // 创建原数组的副本
      newTableData.splice(index, 1); // 更新副本中指定索引位置的元素
      setTableData(newTableData); // 更新 state 中的数据
    }
  };

  return (
    <ApisContext.Provider
      value={{
        tableData,
        getDatasApi,
        createDataApi,
        updateDataApi,
        dragDataApi,
        deleteDataApi,
      }}
    >
      {children}
    </ApisContext.Provider>
  );
};
