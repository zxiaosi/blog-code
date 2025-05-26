import {
  Background,
  BackgroundVariant,
  Node,
  OnSelectionChangeParams,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import '@xyflow/react/dist/style.css'; // 引入样式
import './index.css';

/** 节点组padding (不想要可设置为0) */
const GROUP_PADDING = 10;

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
    type: 'smoothstep',
  },
];

/** 自定义选择分组组件 */
const CustomSelectGroup = () => {
  const { setNodes, getNodes, getNodesBounds } = useReactFlow();

  const [selected, setSelected] = useState<OnSelectionChangeParams>({
    nodes: [],
    edges: [],
  });

  /** 节点/连接线选择事件 */
  const handleSelectionChange = useCallback(
    (nodeEdgeObj: OnSelectionChangeParams) => {
      setSelected?.(nodeEdgeObj);
    },
    [],
  );

  /** 创建组 */
  const handleCreateGroup = () => {
    const selectedNodes = selected?.nodes || [];

    // 生成组 ID
    const groupId = uuidv4();
    // 获取所有选中节点的 ID
    const selectedNodeIds = selectedNodes.map((node) => node.id);
    // 获取所有节点的最大/最小坐标
    const { x, y, width, height } = getNodesBounds(selectedNodes);

    // 创建组节点
    const groupNode = {
      id: groupId,
      type: 'group',
      data: {},
      position: { x: x - GROUP_PADDING, y: y - GROUP_PADDING },
      width: width + GROUP_PADDING * 2,
      height: height + GROUP_PADDING * 2,
      style: {
        backgroundColor: 'rgba(207, 182, 255, 0.4)',
        borderColor: '#9e86ed',
      },
    } satisfies Node;

    // 获取所有节点
    const nodes = getNodes();

    // 更新节点
    const updatedNodes: Node[] = nodes.map((node) => {
      if (selectedNodeIds.includes(node.id)) {
        const { position } = node;
        return {
          ...node,
          parentId: groupId,
          extent: 'parent',
          position: {
            x: position.x - Math.abs(x) + GROUP_PADDING,
            y: position.y - Math.abs(y) + GROUP_PADDING,
          },
          selected: false,
        };
      }
      return node;
    });

    setNodes([groupNode, ...updatedNodes]); // groupNode 必须放在前面, 否则会导致 extent: 'parent' 不生效
  };

  /** 移除组 */
  const handleRemoveGroup = () => {
    const selectedNodes = selected?.nodes || [];

    const groupId = selectedNodes[0].id;
    // 获取所有节点
    const allNodes = getNodes();
    // 获取最新的组节点, 防止组节点坐标被修改
    const realNode = allNodes.filter((node) => node.id === groupId);

    setNodes((nodes) =>
      nodes
        .map((node) => {
          const { parentId, position } = node;
          if (parentId === groupId) {
            const x = position.x + realNode[0].position.x;
            const y = position.y + realNode[0].position.y;
            return {
              ...node,
              parentId: undefined,
              extent: undefined,
              position: { x, y },
            };
          }
          return node;
        })
        .filter((node) => node.id !== groupId),
    );
  };

  return (
    <ReactFlow
      fitView
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      onSelectionChange={handleSelectionChange}
      proOptions={{ hideAttribution: true }}
    >
      {/* 背景 */}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

      {/* 面板 */}
      <Panel position="top-left">
        <div className="custom-select-group">
          <div
            className={`btn ${
              selected?.nodes.length < 1 ||
              selected.nodes.some(
                (node) => node.type === 'group' || node.parentId,
              )
                ? 'btn-disabled'
                : ''
            }`}
            onClick={handleCreateGroup}
          >
            创建组
          </div>
          <div
            className={`btn ${
              selected?.nodes.length !== 1 ||
              selected?.nodes[0].type !== 'group'
                ? 'btn-disabled'
                : ''
            }`}
            onClick={handleRemoveGroup}
          >
            删除组
          </div>
        </div>
      </Panel>
    </ReactFlow>
  );
};

/** Provider */
const CustomSelectGroupProvider = () => {
  return (
    <ReactFlowProvider>
      <CustomSelectGroup />
    </ReactFlowProvider>
  );
};

export default CustomSelectGroupProvider;
