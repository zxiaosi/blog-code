/// <reference types="vite/client" />

declare module 'remote/*' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}
