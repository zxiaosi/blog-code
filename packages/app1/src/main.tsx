import { createRoot, type Root } from 'react-dom/client';
import { name } from '../package.json';
import App from './App.tsx';
import './index.css';

let root: Root;
const render = (props: any = {}) => {
  const container = props?.container
    ? props.container.querySelector('#root')
    : document.getElementById('root');

  root = createRoot(container);

  root.render(<App appName={props.appName} />);
};

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log(`${name} bootstrap`);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function mount(props: any) {
  console.log(`${name} mount`, props);
  render({ ...props, appName: import.meta.env.VITE_APP_NAME });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function unmount(props: any) {
  console.log(`${name} unmount`, props);
  root.unmount();
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function update(props: any) {
  console.log(`${name} update`, props);
}
