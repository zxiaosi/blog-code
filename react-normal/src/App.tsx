import { memo, useCallback, useMemo, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

/**
 * memo
 * - 如果 nextProps 与 nextState 相同，则组件不重新渲染
 * - 即使 const TestMemo = memo(({ otherState })=> {}); 也不会重新渲染, 因为父组件中变更的state与otherState无关
 * - 只有当父组件中otherState发生变化时，才会重新渲染
 */
const TestMemo = memo(() => {
  console.log('TestMemo');
  return <p>TestMemo</p>;
});

/**
 * memo + useCallback
 * - useCallback 缓存函数，避免每次渲染都生成新的函数
 */
const TestMemoCallback = memo(({ onClick }: any) => {
  console.log('TestMemoCallback', onClick);
  return <button onClick={onClick}>TestMemoCallback</button>;
});

/**
 * memo + useMemo
 * - useMemo 缓存计算结果，避免每次渲染都重新计算
 */
const TestMemoUseMemo = memo(({ arr }: any) => {
  console.log('TestMemoUseMemo');
  return <p>{arr}</p>;
});

function App() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {}, []);

  const arr = useMemo(() => [1, 2, 3], []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      <TestMemo />
      <TestMemoCallback onClick={handleClick} />
      <TestMemoUseMemo arr={arr} />
    </>
  );
}

export default App;
