import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Edge,
  EdgeProps,
  getSmoothStepPath,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect, useRef } from 'react';

import '@xyflow/react/dist/style.css'; // 引入样式
import { isEmpty } from 'lodash';
import './index.css';

/** 顶点坐标 */
type Vertices = { x: number; y: number };

/** 默认节点 */
const defaultNodes = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 400, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 0, y: 200 },
  },
];

/** 默认连接线 */
const defaultEdges = [
  {
    id: '1-2',
    source: '1',
    target: '2',
    type: 'customEdge',
  },
];

/** 解析路径, 获取拐点 */
const getVerticesByPathUtil = (path: string) => {
  const regex = /L\s+(\d+),(\d+)/g; // 匹配 L x,y 的格式
  const vertices: Vertices[] = [];
  let match;

  while ((match = regex.exec(path)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    vertices.push({ x, y });
  }

  return vertices;
};

/** 自定义连接线 */
const CustomEdge = memo((props: EdgeProps<Edge<{ vertices: Vertices[] }>>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  } = props;

  const { updateEdgeData, screenToFlowPosition } = useReactFlow();

  const edgePathRef = useRef(''); // 连接线路径
  const mouseDownIdRef = useRef(-1); // 鼠标按下的拐点索引

  // 如果有拐点，则使用拐点坐标
  if (data?.vertices) {
    // 组合所有路径点（起点 + 拐点 + 终点）
    const points = [
      { x: sourceX, y: sourceY },
      ...(data?.vertices || []), // 拐点
      { x: targetX, y: targetY },
    ];

    // 生成直角路径指令
    edgePathRef.current = points.reduce((path, point, i) => {
      return i === 0
        ? `M ${point.x},${point.y}`
        : `${path} L ${point.x},${point.y}`;
    }, '');
  }

  // 如果没有拐点，则使用默认路径
  useEffect(() => {
    if (data?.vertices) return;

    // 获取路径
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 0, // 圆角还是直角
    });

    edgePathRef.current = path; // 更新路径

    // 解析路径，获取拐点坐标
    const vertices = getVerticesByPathUtil(edgePathRef.current) || [];

    // 更新拐点坐标
    updateEdgeData(id, { vertices: vertices });
  }, [updateEdgeData]);

  /** 鼠标移动事件 */
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseDownIdRef.current < 0) return;
    event.preventDefault();
    const dragX = event.clientX;
    const dragY = event.clientY;

    const newVertices = [...(data?.vertices || [])];
    newVertices[mouseDownIdRef.current] = screenToFlowPosition(
      { x: dragX, y: dragY },
      { snapToGrid: false },
    );
    // 更新拐点坐标
    updateEdgeData(id, { vertices: newVertices });
  };

  /** 鼠标抬起事件 */
  const handleMouseUp = () => {
    mouseDownIdRef.current = -1;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  /** 鼠标按下事件 */
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    mouseDownIdRef.current = index;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <BaseEdge id={id} path={edgePathRef.current} />

      {selected &&
        !isEmpty(data?.vertices) &&
        data?.vertices?.map((vertex, index) => (
          <circle
            key={index}
            tabIndex={0}
            cx={vertex.x}
            cy={vertex.y}
            r="4px"
            fill="#ff0066"
            strokeWidth={1}
            stroke={mouseDownIdRef.current === index ? 'black' : 'white'}
            style={{ pointerEvents: 'all', outline: 'none' }}
            onMouseDown={(e) => handleMouseDown(e, index)}
          />
        ))}
    </>
  );
});

/** 注入连接线 */
const edgeTypes = { customEdge: CustomEdge };

/** 自定义连接线动画组件 */
const CustomEditableEdge = () => {
  return (
    <ReactFlow
      fitView
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      edgeTypes={edgeTypes}
      proOptions={{ hideAttribution: true }}
    >
      {/* 背景 */}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

/** Provider */
const CustomEditableEdgeProvider = () => {
  return (
    <ReactFlowProvider>
      <CustomEditableEdge />
    </ReactFlowProvider>
  );
};

export default CustomEditableEdgeProvider;
