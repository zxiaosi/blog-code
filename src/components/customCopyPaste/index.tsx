import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  OnSelectionChangeParams,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { cloneDeep } from 'lodash';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import '@xyflow/react/dist/style.css'; // 引入样式
import './index.css';

/** 粘贴时偏移量 */
const OFFSET = 50;

/** 默认节点 */
const defaultNodes = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
  },
];

/** 默认连接线 */
const defaultEdges = [
  {
    id: '1-2',
    source: '1',
    target: '2',
  },
];

/** 自定义复制粘贴组件 */
const CustomCopyPaste = () => {
  // 监听 'Control+v', 'Meta+v' 不能连续粘贴
  // const keyPress = useKeyPress(['v']); // 可以监听按键变化, 不过比较难判断

  const { setNodes, setEdges, getNodes } = useReactFlow();

  const [selected, setSelected] = useState<OnSelectionChangeParams>();

  /** 节点/连接线选择事件 */
  const handleSelectionChange = useCallback(
    (nodeEdgeObj: OnSelectionChangeParams) => {
      setSelected?.(nodeEdgeObj);
    },
    [],
  );

  /** 粘贴事件 */
  const handlePaste = useCallback(() => {
    if (selected?.nodes.length === 0) return;

    const selectedNodes = selected?.nodes || [];
    const selectedEdges = selected?.edges || [];

    // 获取当前选中的节点(防止复制节点之后, 节点移动, 坐标未更新)
    const selectedNodeIds = new Set(selectedNodes?.map((_) => _.id) || []);
    const allNodes = getNodes() || [];
    const newSelectedNodes = allNodes.filter((_) => selectedNodeIds.has(_.id));

    // 创建旧节点ID到新节点ID的映射
    const nodeIdMap = selectedNodes?.reduce(
      (acc, node) => {
        acc[node.id] = uuidv4();
        return acc;
      },
      {} as Record<string, string>,
    );

    // 生成新节点
    const newNodes = cloneDeep(newSelectedNodes)?.map((node) => ({
      ...node,
      id: nodeIdMap?.[node.id],
      position: {
        x: node.position.x + OFFSET,
        y: node.position.y + OFFSET,
      },
      selected: true,
    })) as Node[];

    // 生成新边
    const newEdges = cloneDeep(selectedEdges)?.map((edge) => {
      const { source, target } = edge;
      const newSource = nodeIdMap?.[source];
      const newTarget = nodeIdMap?.[target];
      const id = [newSource, newTarget].filter(Boolean).join('-');

      return {
        ...edge,
        id,
        source: newSource || source,
        target: newTarget || target,
        selected: true,
      };
    }) as Edge[];

    // 更新状态（单次批量更新）
    setNodes((prevNodes) => [
      ...prevNodes.map((node) =>
        newSelectedNodes?.some((n) => n.id === node.id)
          ? { ...node, selected: false }
          : node,
      ),
      ...newNodes,
    ]);

    setEdges((prevEdges) => [
      ...prevEdges.map((edge) =>
        selectedEdges?.some((e) => e.id === edge.id)
          ? { ...edge, selected: false }
          : edge,
      ),
      ...newEdges,
    ]);
  }, [selected?.nodes, selected?.edges, getNodes, setNodes, setEdges]);

  /** 按键抬起事件(选中节点才会触发) */
  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'v') {
        handlePaste();
      }
    },
    [handlePaste],
  );

  return (
    <ReactFlow
      fitView
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      onSelectionChange={handleSelectionChange}
      onKeyUp={handleKeyUp}
      // selectionKeyCode={'Shift'} // 选中一片
      // multiSelectionKeyCode={['Control', 'Meta']} // 多选
      // deleteKeyCode={'Backspace'} // 删除选中节点
      proOptions={{ hideAttribution: true }}
    >
      {/* 背景 */}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

      {/* 面板 */}
      <Panel position="top-left">
        <div className="custom-copy-paste">
          <div>Ctrl/Command + V 可以粘贴</div>
          <div>长按Ctrl + 选中 可以多选</div>
          <div>长按Shif + 拖拽 可以多选</div>
          <div
            className={`btn ${
              selected?.nodes.length === 0 ? 'btn-disabled' : ''
            }`}
            onClick={handlePaste}
          >
            粘贴
          </div>
        </div>
      </Panel>
    </ReactFlow>
  );
};

/** Provider */
const CustomCopyPasteProvider = () => {
  return (
    <ReactFlowProvider>
      <CustomCopyPaste />
    </ReactFlowProvider>
  );
};

export default CustomCopyPasteProvider;
