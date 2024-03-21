import { Segmented } from 'antd';
import './App.css';
import { useEffect, useState } from 'react';
import CustomResizeBox from './components/CustomResizeBox';
import CustomDragModal from './components/CustomDragModal';
import CustomDndkit from './components/CustomDndkit';
import CustomDndkitMenu from './components/CustomDndkitMenu';

type RouterParams = 'resizeBox' | 'dragModal' | 'dndkit' | 'dndkitMenu';

/** options */
const options = [
  { label: '可伸缩侧边栏', value: 'resizeBox' },
  { label: '手写拖拽Modal组件', value: 'dragModal' },
  { label: '使用dnd-kit实现拖拽组件', value: 'dndkit' },
  { label: '使用dnd-kit实现嵌套可拖动菜单', value: 'dndkitMenu' },
];

function App() {
  const [routerParams, setRouterParams] = useState<RouterParams>('resizeBox');

  useEffect(() => {
    const url = window.location.href;
    const params = url.split('/').pop() as RouterParams;
    if (options.map((_) => _.value).includes(params)) setRouterParams(params);
    else window.history.pushState({}, '', `/resizeBox`);
  }, [routerParams]);

  /** 跳转到指定页面 */
  const handleChange = (value: any) => {
    setRouterParams(value);
    window.history.pushState({}, '', `/${value}`);
  };

  return (
    <div className="page">
      <div className="segmented">
        <Segmented
          options={options}
          size="large"
          value={routerParams}
          onChange={handleChange}
        />
      </div>

      <div className="content">
        {routerParams === 'resizeBox' && <CustomResizeBox />}
        {routerParams === 'dragModal' && <CustomDragModal />}
        {routerParams === 'dndkit' && <CustomDndkit />}
        {routerParams === 'dndkitMenu' && <CustomDndkitMenu />}
      </div>
    </div>
  );
}

export default App;
