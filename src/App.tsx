import * as components from './components';
import './App.css';

const items = [
  { key: 'SuspenseDemo', label: 'Suspense' },
  { key: 'RefDemo', label: <a href="https://zh-hans.react.dev/blog/2024/04/25/react-19#ref-as-a-prop">ref 作为一个属性</a> },
];

function App() {
  /** 加载模块 */
  const loadComponent = (key: any) => {
    const Component = components?.[key];
    return Component ? <Component /> : <></>;
  };

  return (
    <>
      <div className="page">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="item">
            <h2>{items?.[index]?.label}</h2>
            <div>{loadComponent(items?.[index]?.key)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
