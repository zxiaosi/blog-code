import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

/** 编译器会自动优化 */
const TestMemo = () => {
  console.log('TestMemo');
  return <p>TestMemo</p>;
};

/** 编译器会自动优化 */
const TestMemoCallback = ({ onClick }: any) => {
  console.log('TestMemoCallback', onClick);
  return <button onClick={onClick}>TestMemoCallback</button>;
};

/** 编译器会自动优化 */
const TestMemoUseMemo = ({ arr }: any) => {
  console.log('TestMemoUseMemo');
  return <p>{arr}</p>;
};

function App() {
  const [count, setCount] = useState(0);

  // 编译器自动优化
  const handleClick = () => {};

  // 编译器自动优化
  const arr = [1, 2, 3];

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
