import {
  Background,
  BackgroundVariant,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import useEdgeType, { EdgeType } from '../../hooks/useEdgeType';

import '@xyflow/react/dist/style.css'; // 引入样式
import './index.css';

/** 是否反转动画 */
const reverse = false;

/** 动画小圆点个数 */
const count = 10;

/** 连接线类型 */
const edgeTypeOptions = [
  'default',
  'straight',
  'step',
  'smoothstep',
  'simplebezier',
] satisfies EdgeType[];

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

/** 自定义连接线 */
const CustomEdge = memo((props: EdgeProps) => {
  const list = Array.from({ length: count });

  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  let path = ''; // 路线
  const params = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  const { edgeType } = useEdgeType(
    useShallow((state) => ({
      edgeType: state.edgeType,
    })),
  );

  console.log('edgeType', edgeType);

  switch (edgeType) {
    case 'default': {
      const bezierPath = getBezierPath(params);
      path = bezierPath[0];
      break;
    }
    case 'simplebezier': {
      const bezierPath = getSimpleBezierPath(params);
      path = bezierPath[0];
      break;
    }
    case 'smoothstep': {
      const smoothStepPath = getSmoothStepPath({ ...params, borderRadius: 5 });
      path = smoothStepPath[0];
      break;
    }
    case 'step': {
      const smoothStepPath = getSmoothStepPath({ ...params, borderRadius: 0 });
      path = smoothStepPath[0];
      break;
    }
    case 'straight': {
      const smoothStepPath = getStraightPath(params);
      path = smoothStepPath[0];
      break;
    }
  }

  return (
    <>
      <BaseEdge id={id} path={path} />

      {list?.map((point, index) => (
        <circle
          key={index}
          r={'2'}
          fill={`rgba(255, 195, 0, ${0.1 * (count - index)})`}
          style={{
            filter: 'drop-shadow(0px 0px 2px rgb(255, 195, 0))',
          }}
        >
          <animateMotion
            dur={'6s'}
            repeatCount={'indefinite'}
            path={path}
            begin={`${0.02 * (index + 1)}s`}
            keyPoints={reverse ? '1;0' : '0;1'} //
            keyTimes={'0;1'}
          />
        </circle>
      ))}
    </>
  );
});

/** 自定义连接线动画组件 */
const CustomEdgeAnimation = () => {
  const { onChangeEdgeType } = useEdgeType(
    useShallow((state) => ({
      onChangeEdgeType: state.onChangeEdgeType,
    })),
  );

  return (
    <ReactFlow
      fitView
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      edgeTypes={{ customEdge: CustomEdge }}
      proOptions={{ hideAttribution: true }}
    >
      {/* 背景 */}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

      {/* 面板 */}
      <Panel position="top-left">
        <div className="custom-edge-animation">
          {edgeTypeOptions?.map((item) => (
            <div
              key={item}
              className={`btn`}
              onClick={() => onChangeEdgeType?.(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </ReactFlow>
  );
};

/** Provider */
const CustomEdgeAnimationProvider = () => {
  return (
    <ReactFlowProvider>
      <CustomEdgeAnimation />
    </ReactFlowProvider>
  );
};

export default CustomEdgeAnimationProvider;
