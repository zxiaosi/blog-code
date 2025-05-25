import { create } from 'zustand';

export type EdgeType =
  | 'default'
  | 'straight'
  | 'step'
  | 'smoothstep'
  | 'simplebezier';

interface Props {
  /** 连接线类型 */
  edgeType?: EdgeType;
  /** 切换连接线类型事件 */
  onChangeEdgeType: (edgeType: EdgeType) => void;
}

/** 连接线类型 */
const useEdgeType = create<Props>((set) => ({
  edgeType: 'default',
  onChangeEdgeType: (edgeType) => set(() => ({ edgeType })),
}));

export default useEdgeType;
