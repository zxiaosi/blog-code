import { useEffect, useRef } from "react";

/**
 * 自定义定时器
 * @param callback 回调函数
 * @param delay 延迟时间
 * @returns void
 * @example
 * ```tsx
 * useInterval(() => {
 *  console.log("Hello, World!");
 * }, 1000);
 * ```
 */
const useInterval = (callback: () => void, delay: number) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay) return;

    const id = setInterval(() => {
      savedCallback.current?.();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
};

export default useInterval;
