import axios from 'axios';
import useRequest, { IReqOption, ISwrOption } from '../request';

enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * 创建通用请求hook
 * 不想每次都写 reqtOption?: IReqOption, swrOption?: ISwrOption 😅
 */
export const createApiHook = (
  defaultReq: IReqOption = {},
  defaultSWR: ISwrOption = {}
) => {
  return (reqtOption?: IReqOption, swrOption?: ISwrOption) => {
    return useRequest(
      { ...defaultReq, ...reqtOption },
      { ...defaultSWR, ...swrOption }
    );
  };
};

// 原始用法1 eg: export const useTestApi = (reqtOption?: IReqOption, swrOption?: ISwrOption) => useRequest({ ...reqtOption }, { ...swrOption });

// 原始用法2 eg: export const useTestApi = (reqtOption?: IReqOption, swrOption?: ISwrOption) => useRequest({}, {}, axios.get(xxx));

// 自定义hook eg: export const useTestApi = createApiHook({ url: "/test", method: Method.GET }, { revalidateOnMount: false });

/** 测试 */
export const useTestApi = createApiHook({
  url: '/hello.json',
  method: Method.GET,
});

/** 用户登录 */
export const useLoginApi = createApiHook({
  url: '/login.json',
  method: Method.POST,
});

/** 使用 Axios 原始用法 */
export const useHitokotoApi = (
  reqtOption?: IReqOption,
  swrOption?: ISwrOption
) =>
  useRequest({ ...reqtOption }, { ...swrOption }, () =>
    axios.get('https://v1.hitokoto.cn/')
  );
