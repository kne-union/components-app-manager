import { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { Alert, Button, Segmented, Space, Tooltip, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, DesktopOutlined, ExportOutlined, MobileOutlined, ReloadOutlined } from '@ant-design/icons';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import resolveHomeUrl from '@common/resolveHomeUrl';
import style from './style.module.scss';

const EMBED_MSG_SOURCE = 'kne-pwa-document';
const EMBED_HOST_SOURCE = 'kne-app-center-home';
const postHistory = (iframe, action) => {
  try {
    iframe?.contentWindow?.postMessage({ source: EMBED_HOST_SOURCE, type: 'history', action }, '*');
  } catch (e) {
    // ignore
  }
};

/** 主页：仿浏览器工具栏 + 手机/电脑预览切换 */
const Home = withLocale(({ data }) => {
  const { formatMessage } = useIntl();
  const homeSrc = resolveHomeUrl(data);
  const iframeRef = useRef(null);
  const stackRef = useRef(homeSrc ? [homeSrc] : []);
  const indexRef = useRef(0);
  const [frameKey, setFrameKey] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(homeSrc || '');
  const [navReady, setNavReady] = useState(false);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);
  const [viewport, setViewport] = useState('desktop');

  const postViewport = useCallback(mode => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ source: EMBED_HOST_SOURCE, type: 'viewport', mode }, '*');
    } catch (e) {
      // ignore
    }
  }, []);

  const onViewportChange = value => {
    setViewport(value);
    postViewport(value);
  };

  const syncNavFlags = useCallback(() => {
    setCanBack(indexRef.current > 0);
    setCanForward(indexRef.current < stackRef.current.length - 1);
  }, []);

  const pushLocation = useCallback(
    href => {
      if (!href) {
        return;
      }
      const stack = stackRef.current;
      const index = indexRef.current;
      if (stack[index] === href) {
        setCurrentUrl(href);
        syncNavFlags();
        return;
      }
      const next = stack.slice(0, index + 1);
      next.push(href);
      stackRef.current = next;
      indexRef.current = next.length - 1;
      setCurrentUrl(href);
      syncNavFlags();
    },
    [syncNavFlags]
  );

  useEffect(() => {
    const onMessage = event => {
      const payload = event?.data;
      if (!payload || payload.source !== EMBED_MSG_SOURCE || payload.type !== 'location') {
        return;
      }
      const win = iframeRef.current?.contentWindow;
      if (!win || event.source !== win) {
        return;
      }
      setNavReady(true);
      pushLocation(payload.href || homeSrc);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [homeSrc, pushLocation]);

  const onFrameLoad = () => {
    setNavReady(true);
    postViewport(viewport);
    const win = iframeRef.current?.contentWindow;
    if (!win) {
      return;
    }
    try {
      pushLocation(win.location.href);
    } catch (e) {
      if (!stackRef.current.length && homeSrc) {
        stackRef.current = [homeSrc];
        indexRef.current = 0;
        setCurrentUrl(homeSrc);
        syncNavFlags();
      }
    }
  };

  const goBack = () => {
    if (indexRef.current <= 0) {
      return;
    }
    indexRef.current -= 1;
    setCurrentUrl(stackRef.current[indexRef.current] || homeSrc);
    syncNavFlags();
    postHistory(iframeRef.current, 'back');
  };

  const goForward = () => {
    if (indexRef.current >= stackRef.current.length - 1) {
      return;
    }
    indexRef.current += 1;
    setCurrentUrl(stackRef.current[indexRef.current] || homeSrc);
    syncNavFlags();
    postHistory(iframeRef.current, 'forward');
  };

  const reload = () => {
    postHistory(iframeRef.current, 'reload');
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch (e) {
      setFrameKey(key => key + 1);
    }
  };

  if (!homeSrc) {
    return <Alert type="warning" showIcon message={formatMessage({ id: 'appManager.home.missingUrl' })} />;
  }

  const isMobileViewport = viewport === 'mobile';

  return (
    <div className={style['home']}>
      <div className={style['toolbar']}>
        <Space size={4} className={style['nav']}>
          <Tooltip title={formatMessage({ id: 'appManager.home.back' })}>
            <Button type="text" size="small" icon={<ArrowLeftOutlined />} disabled={!navReady || !canBack} onClick={goBack} aria-label="back" />
          </Tooltip>
          <Tooltip title={formatMessage({ id: 'appManager.home.forward' })}>
            <Button type="text" size="small" icon={<ArrowRightOutlined />} disabled={!navReady || !canForward} onClick={goForward} aria-label="forward" />
          </Tooltip>
          <Tooltip title={formatMessage({ id: 'appManager.home.reload' })}>
            <Button type="text" size="small" icon={<ReloadOutlined />} disabled={!navReady} onClick={reload} aria-label="reload" />
          </Tooltip>
        </Space>
        <Segmented
          size="small"
          className={style['viewport']}
          value={viewport}
          onChange={onViewportChange}
          options={[
            {
              value: 'desktop',
              icon: (
                <Tooltip title={formatMessage({ id: 'appManager.home.desktop' })}>
                  <DesktopOutlined />
                </Tooltip>
              )
            },
            {
              value: 'mobile',
              icon: (
                <Tooltip title={formatMessage({ id: 'appManager.home.mobile' })}>
                  <MobileOutlined />
                </Tooltip>
              )
            }
          ]}
        />
        <div className={style['address']}>
          <Typography.Text className={style['url']} ellipsis={{ tooltip: true }}>
            {currentUrl || homeSrc}
          </Typography.Text>
        </div>
        <Typography.Link className={style['open-new']} href={currentUrl || homeSrc} target="_blank" rel="noopener noreferrer">
          <ExportOutlined /> {formatMessage({ id: 'appManager.home.openNew' })}
        </Typography.Link>
      </div>
      <div className={classnames(style['stage'], isMobileViewport && style['stage-mobile'])}>
        <div className={classnames(style['device'], isMobileViewport && style['device-mobile'])}>
          <div className={isMobileViewport ? style['device-clip'] : style['device-fill']}>
            <iframe
              key={frameKey}
              ref={iframeRef}
              className={style['frame']}
              title={formatMessage({ id: 'appManager.tabs.home' })}
              src={homeSrc}
              onLoad={onFrameLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Home;
