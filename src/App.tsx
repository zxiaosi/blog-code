import './App.css';
import { useState } from 'react';
import { useTestApi, useLoginApi, useHitokotoApi } from '../apis/index';

function App() {
  const [tabId, setTabId] = useState(0);

  const [user, setUser] = useState({
    username: 'admin',
    password: '123456',
  });

  const { repsonse: testData } = useTestApi();

  /**
   * 1. 页面渲染时不请求, 点击按钮 才会发起请求
   * 2. 这里不能使用 { isReq: false }, isReq 把全局key置为null, 点击请求时 useSWR 找不到这个key, 导致无法请求
   */
  const { mutate: loginMutate } = useLoginApi(
    {}, // { data: { ...user } }, // 请求携带参数
    { revalidateOnMount: false }
  );

  /**
   * 1. 切换tab 或 点击按钮 才会发起请求
   * 2. repsonse 是最新的请求的值
   */
  const { repsonse: hitokoto, mutate: hitokotoMutate } = useHitokotoApi(
    { isReq: tabId == 1, isShowFailMsg: false },
    {}
  );

  const handleLogin = async () => {
    // 这里可以直接使用 useLoginApi 的 repsonse, 参考 useHitokotoApi 的 repsonse
    const {
      data: { data },
    }: any = await loginMutate();
    setUser(data);
  };

  const handleRefresh = () => {
    hitokotoMutate();
  };

  return (
    <div className="page">
      <div className="title">
        <h2>{testData?.data}</h2>

        <div className="btn" onClick={() => setTabId(1 - tabId)}>
          切换
        </div>
      </div>

      {tabId == 0 ? (
        <div className="login">
          <input
            type="text"
            placeholder="请输入账号"
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="请输入密码"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
          <div className="btn" onClick={handleLogin}>
            登录
          </div>
        </div>
      ) : (
        <div className="hitokoto">
          {hitokoto?.hitokoto && (
            <div className="text">
              {hitokoto?.hitokoto} 出自 {hitokoto?.from}
            </div>
          )}

          <div className="btn" onClick={handleRefresh}>
            刷新
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
