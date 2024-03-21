import axios, { AxiosError } from "axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * 错误处理: https://www.axios-http.cn/docs/handling_errors
 * ① 发送请求时出了点问题，比如网络错误
 * ② 请求已经成功发起，但没有收到响应
 * ③ 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
 */

// Axios全局配置 https://axios-http.com/docs/config_defaults
axios.defaults.baseURL = "http://localhost:5173/apis";

axios.interceptors.request.use(
  (config: any) => {
    // 这里可以做一些请求拦截，比如请求头携带 token

    // @ts-ignore (防止下面报错)
    // config.headers.Authorization = localStorage.getItem("token");

    return config;
  },
  (error: AxiosError) => {
    // 发送请求时出了点问题，比如网络错误 https://segmentfault.com/q/1010000020659252
    console.log("请求发起错误 -- ${error.message}");
    return Promise.reject(error);
  }
);

// 响应拦截器(全局配置)
axios.interceptors.response.use(
  (response: AxiosResponse<IResponseData>) => {
    // status >= 200 && status < 300 (HTTP 成功)
    const {
      data: { code, msg },
      config,
    } = response;
    const { isShowFailMsg: isShowFailToast, isThrowError } =
      config as IRequestOption; // 请求配置

    if (code == 0) {
      // 业务成功 (后端定义的成功)
      // console.log("请求成功！");
    } else {
      // 业务失败 (后端定义的失败)
      isShowFailToast && console.log(msg);
      if (isThrowError) throw new Error(`后端返回的错误信息-- ${msg}`); // 抛出错误, 阻止程序向下执行 (默认配置)
    }

    return response;
  },
  (error: AxiosError) => {
    // HTTP 失败
    const { response, config } = error;
    const {
      url,
      isShowFailMsg: isShowFailToast,
      isThrowError,
    } = config as IRequestOption;

    let errMsg = ""; // 错误信息

    if (response) {
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      const { status, data } = response as AxiosResponse;
      errMsg = data.msg || `url:${(url || "").toString()},statusCode:${status}`;

      if (status == 401) {
        // 跳转登录
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } else {
      // 请求已经成功发起，但没有收到响应
      errMsg = "请求超时或服务器异常，请检查网络或联系管理员！";
    }

    isShowFailToast && console.log(errMsg);

    return Promise.reject(
      isThrowError ? new Error(`请求失败 -- ${errMsg}`) : error
    );
  }
);

/** 自定义请求体 */
export interface IRequestData {
  [key: string]: any;
}

/** 自定义响应体 */
export interface IResponseData<T = any> {
  code: number;
  msg: string;
  data: T;
  total?: number;
  [key: string]: any;
}

/** 自定义配置项 */
export interface IRequestOption
  extends Partial<AxiosRequestConfig<IRequestData>> {
  /**
   * 是否显示失败Toast弹框
   * @default true
   */
  isShowFailMsg?: boolean;

  /**
   * 是否抛出错误 (阻止代码的继续运行)
   * @default true
   */
  isThrowError?: boolean;
}

// 封装请求类
class Http {
  defaultOptions: IRequestOption = {
    // 自定义配置项默认值
    isShowFailMsg: true,
    isThrowError: true,
  };

  // 请求配置 https://www.axios-http.cn/docs/req_config
  request(options: IRequestOption): Promise<AxiosResponse<IResponseData>> {
    // 请求头中的 Content-Type , axios 默认会自动设置合适的 Content-Type
    // const withCredentials = true; // 是否携带cookie (放到实例配置中)
    const { url: requestUrl, params: requestData } = this.transformParam(
      options,
      options.data,
      options.url || ""
    );
    const requestOptions = { ...this.defaultOptions, ...options };
    const config = {
      // withCredentials,
      url: requestUrl,
      data: requestData,
      ...requestOptions,
    };
    return axios.request(config);
  }

  /** 处理请求参数 */
  transformParam(options: IRequestOption, param: any, url: string) {
    if (options.method == "GET" || options.method == "DELETE") {
      let paramStr = "";
      for (const i in param) {
        // 防止特殊字符
        if (paramStr === "")
          paramStr += "?" + i + "=" + encodeURIComponent(param[i]);
        else paramStr += "&" + i + "=" + encodeURIComponent(param[i]);
      }
      return { url: url + paramStr, params: {} };
    } else {
      return { url: url, params: param };
    }
  }
}

const http = new Http();
export default http;
