import { useLogData } from '@/hooks';
import { Button, Space } from 'antd';
import './index.less';

const CustomError = () => {
  const loading = useLogData((state) => state.loading);

  /** js错误 */
  const handleCodeError = () => {
    let a = undefined;
    if (a.length) {
      console.log('1');
    }
  };

  /** 异步错误 */
  const handleAsyncError = () => {
    setTimeout(() => {
      JSON.parse('');
    });
  };

  /** promise错误 */
  const handlePromiseErr = () => {
    new Promise((resolve) => {
      let person = {};
      person.name.age();
      resolve();
    });
  };

  /** xhr请求报错 */
  const handleXhrError = () => {
    let ajax = new XMLHttpRequest();
    ajax.open('GET', 'https://abc.com/test/api');
    ajax.setRequestHeader('content-type', 'application/json');
    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4) {
        console.log('handleXhrError', ajax);
      }
      if (ajax.status === 200 || ajax.status === 304) {
        console.log('handleXhrError', ajax);
      }
    };
    ajax.send();
    ajax.addEventListener('loadend', () => {});
  };

  /** fetch请求报错 */
  const handleFetchError = () => {
    fetch('https://jsonplaceholder.typicode.com/posts/a')
      .then((res) => {
        if (res.status == 404) {
          console.log('handleFetchError', res);
        }
      })
      .catch((err) => {
        console.log('handleFetchError', err);
      });
  };

  /** 加载资源报错 */
  const handleResourceError = () => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://abc.com/index.js';
    document.body.appendChild(script);
    // 资源加载失败
    script.onerror = (err) => {
      console.log('handleResourceError', err);
    };
  };

  return (
    <div className="custom-error">
      <Space wrap>
        <Button variant="solid" color="purple" loading={loading} onClick={handleCodeError}>
          js错误
        </Button>
        <Button variant="solid" color="cyan" loading={loading} onClick={handleAsyncError}>
          异步错误
        </Button>
        <Button variant="solid" color="green" loading={loading} onClick={handlePromiseErr}>
          promise错误
        </Button>
        <Button variant="solid" color="magenta" loading={loading} onClick={handleXhrError}>
          xhr请求报错
        </Button>
        <Button variant="solid" color="orange" loading={loading} onClick={handleFetchError}>
          fetch请求报错
        </Button>
        <Button variant="solid" color="volcano" loading={loading} onClick={handleResourceError}>
          加载资源报错
        </Button>
      </Space>
    </div>
  );
};

export default CustomError;
