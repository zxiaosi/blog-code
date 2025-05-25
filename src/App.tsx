import { useState } from 'react';
import { CustomCopyPaste, CustomEdgeAnimation } from './components';

const buttonItems = [
  {
    key: 'CopyPaste',
    component: <CustomCopyPaste />,
  },
  {
    key: 'EdgeAnimation',
    component: <CustomEdgeAnimation />,
  },
];

function App() {
  const [btn, setBtn] = useState(buttonItems[1].key);

  /** 点击事件 */
  const handleClick = (key: string) => {
    setBtn(key);
  };

  return (
    <>
      <div className="btn-group">
        {buttonItems.map((item) => (
          <div
            key={item.key}
            onClick={() => handleClick(item.key)}
            className="btn"
          >
            {item.key}
          </div>
        ))}
      </div>

      <div className="content">
        {buttonItems.find((item) => item.key === btn)?.component}
      </div>
    </>
  );
}

export default App;
