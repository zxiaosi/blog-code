import { useImperativeHandle, useRef, useState } from 'react';
import './index.css';

const RefDemo = () => {
  const testRef = useRef(null);

  const handleClick = () => {
    testRef.current?.add?.();
  };

  return (
    <div className="ref-demo">
      <button onClick={handleClick}>点击新增</button>
      <Test ref={testRef} />
    </div>
  );
};

export default RefDemo;

const Test = ({ ref }) => {
  const [state, setState] = useState(0);
  useImperativeHandle(ref, () => ({
    add: () => {
      setState((state) => state + 1);
    },
  }));

  return <>{state}</>;
};
