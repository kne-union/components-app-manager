import { Component, useEffect, useMemo } from 'react';
import { Alert, Button, Result, Spin } from 'antd';
import classnames from 'classnames';
import RemoteLoader, { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import withLocale from '@common/withLocale';
import getAppLabel from '@common/appLabel';
import AppStatusGuard from './AppStatusGuard';
import style from './style.module.scss';

/** 联邦容器加载后无法热替换：记录首次加载的版本，之后版本变化只能提示刷新页面 */
const loadedVersions = new Map();

const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads';

export const findMenu = (menus, menuKey) => {
  for (const node of menus || []) {
    if (node.fullKey === menuKey || node.key === menuKey) {
      return node;
    }
    const found = findMenu(node.children, menuKey);
    if (found) {
      return found;
    }
  }
  return null;
};

const withQuery = (url, query) => `${url}${url.includes('?') ? '&' : '?'}${query}`;

const buildPageUrl = (app, menu) => `${String(app.baseUrl || '').replace(/\/+$/, '')}/${String(menu.path || '').replace(/^\/+/, '')}`;

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    return (
      <Alert
        type="error"
        showIcon
        message={this.props.title}
        description={String(error.message || error)}
        action={
          <Button size="small" onClick={() => this.setState({ error: null })}>
            {this.props.retryText}
          </Button>
        }
      />
    );
  }
}

const Loading = () => (
  <div className={style['loading']}>
    <Spin />
  </div>
);

const RemoteEmbed = ({ app, menu, ajax, baseUrl, tenantId, themeToken, className }) => {
  const { formatMessage, locale } = useIntl();
  const { remote } = app;
  const loadedVersion = loadedVersions.get(remote.name);
  const versionChanged = !!(loadedVersion && app.version && loadedVersion !== app.version);

  useEffect(() => {
    if (!versionChanged && !loadedVersions.has(remote.name)) {
      loadedVersions.set(remote.name, app.version || '');
    }
  }, [remote.name, app.version, versionChanged]);

  const remoteOptions = useMemo(
    () => ({
      remotes: {
        [remote.name]: { remote: remote.name, url: remote.url, tpl: '{{url}}', defaultVersion: app.version || '0' }
      }
    }),
    [remote.name, remote.url, app.version]
  );

  if (versionChanged) {
    return (
      <Alert
        type="warning"
        showIcon
        message={formatMessage({ id: 'appEmbed.versionChanged' }, { name: getAppLabel(app, locale) })}
        action={
          <Button size="small" type="primary" onClick={() => window.location.reload()}>
            {formatMessage({ id: 'appEmbed.reload' })}
          </Button>
        }
      />
    );
  }

  return (
    <div className={classnames(style['remote'], 'app-embed-remote', className)}>
      <ErrorBoundary
        key={`${app.name}/${menu.fullKey}`}
        title={formatMessage({ id: 'appEmbed.loadFailed' })}
        retryText={formatMessage({ id: 'appEmbed.retry' })}
      >
        <RemoteLoader
          module={`${remote.name}:${remote.preset || 'ComponentPreset'}`}
          remoteOptions={remoteOptions}
          remoteFallback={<Loading />}
          ajax={ajax}
          apiHost={app.apiHost}
          themeToken={themeToken}
          tenantId={tenantId}
        >
          <RemoteLoader
            module={`${remote.name}:${menu.component}`}
            remoteOptions={remoteOptions}
            remoteFallback={<Loading />}
            appName={app.name}
            baseUrl={baseUrl}
            tenantId={tenantId}
            menu={menu}
            {...(menu.props || {})}
          />
        </RemoteLoader>
      </ErrorBoundary>
    </div>
  );
};

const IframeEmbed = ({ app, menu, className }) => {
  const { formatMessage } = useIntl();
  const src = withQuery(buildPageUrl(app, menu), 'embed=1');
  return (
    <iframe
      className={classnames(style['iframe'], 'app-embed-iframe', className)}
      title={menu.label || app.label || app.name}
      src={src}
      sandbox={app.kind === 'linked' ? IFRAME_SANDBOX : undefined}
      aria-label={formatMessage({ id: 'appEmbed.loadFailed' })}
    />
  );
};

const BlankEmbed = ({ app, menu, className }) => {
  const { formatMessage } = useIntl();
  return (
    <Result
      className={classnames('app-embed-blank', className)}
      title={menu.label || app.label || app.name}
      extra={
        <Button type="primary" onClick={() => window.open(buildPageUrl(app, menu), '_blank', 'noopener')}>
          {formatMessage({ id: 'appEmbed.openInNewWindow' })}
        </Button>
      }
    />
  );
};

const Embedded = props => {
  const { app, menu } = props;
  const { formatMessage, locale } = useIntl();
  if (app.integration === 'remote' && app.remote && menu.component) {
    return <RemoteEmbed {...props} />;
  }
  if (app.integration === 'iframe' && menu.path) {
    return <IframeEmbed {...props} />;
  }
  if (app.integration === 'blank' && menu.path) {
    return <BlankEmbed {...props} />;
  }
  return (
    <Alert
      type="warning"
      showIcon
      message={formatMessage({ id: 'appEmbed.unsupported' }, { name: getAppLabel(app, locale), integration: app.integration })}
    />
  );
};

const AppEmbed = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, appName, menuKey, app: appProp, menu: menuProp, baseUrl, tenantId, themeToken, className }) => {
    const [usePreset] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();

    const renderEmbedded = (app, menu) => {
      if (!app) {
        return <Alert type="warning" showIcon message={formatMessage({ id: 'appEmbed.notFound' }, { name: appName })} />;
      }
      if (!menu) {
        return <Alert type="warning" showIcon message={formatMessage({ id: 'appEmbed.menuNotFound' }, { menu: menuKey })} />;
      }
      return (
        <AppStatusGuard app={app} ajax={ajax} apis={apis}>
          <Embedded app={app} menu={menu} ajax={ajax} baseUrl={baseUrl} tenantId={tenantId} themeToken={themeToken} className={className} />
        </AppStatusGuard>
      );
    };

    if (appProp && menuProp) {
      return renderEmbedded(appProp, menuProp);
    }

    return (
      <Fetch
        {...apis.appManager.centerMenus}
        render={({ data, loading }) => {
          if (loading) {
            return <Loading />;
          }
          const app = (data?.pageData || []).find(item => item.name === appName);
          return renderEmbedded(app, app && findMenu(app.menus, menuKey));
        }}
      />
    );
  })
);

export default AppEmbed;
