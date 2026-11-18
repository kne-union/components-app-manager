import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { DisconnectOutlined } from '@ant-design/icons';
import { useIntl } from '@kne/react-intl';
import getAppLabel from '@common/appLabel';
import style from './style.module.scss';

/**
 * 应用状态守卫：页面照常渲染，挂载后异步向应用中心查一次应用状态。
 * 正常什么都不做；不正常（应用挂了、状态异常）再切换成错误状态。
 * 检测请求本身失败（网络、鉴权）不代表应用有问题，不打断页面。
 */
const AppStatusGuard = ({ app, ajax, apis, children }) => {
  const { formatMessage, locale } = useIntl();
  const [problem, setProblem] = useState(null);
  const [checking, setChecking] = useState(false);
  // ajax / apis 每次渲染可能是新引用，用 ref 取最新值，避免重复检测
  const latest = useRef({ ajax, apis });
  latest.current = { ajax, apis };

  const check = useCallback(async () => {
    try {
      const { ajax: request, apis: allApis } = latest.current;
      const { data: resData } = await request(Object.assign({}, allApis.appManager.centerStatus, { params: { name: app.name } }));
      const status = resData?.code === 0 ? resData.data : null;
      return status && status.healthy === false ? status : null;
    } catch (e) {
      return null;
    }
  }, [app.name]);

  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    check().then(result => {
      if (!cancelled && result) {
        setProblem(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [check]);

  const handleRecheck = async () => {
    setChecking(true);
    const result = await check();
    setProblem(result);
    setChecking(false);
  };

  if (!problem) {
    return children;
  }
  // 只给用户“暂时不可用、可重试”的结论；状态码、后端报错等细节不展示
  return (
    <div className={`app-embed-unavailable ${style.unavailable}`} role="alert">
      <div className={style['unavailable-icon']}>
        <DisconnectOutlined />
      </div>
      <h3 className={style['unavailable-title']}>{formatMessage({ id: 'appEmbed.unavailable' }, { name: getAppLabel(app, locale) })}</h3>
      <p className={style['unavailable-desc']}>{formatMessage({ id: 'appEmbed.unavailableDesc' })}</p>
      <Button loading={checking} onClick={handleRecheck}>
        {formatMessage({ id: 'appEmbed.recheck' })}
      </Button>
    </div>
  );
};

export default AppStatusGuard;
