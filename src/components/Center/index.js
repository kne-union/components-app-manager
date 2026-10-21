import { useEffect, useMemo, useState } from 'react';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import classnames from 'classnames';
import { Empty, Spin, Typography } from 'antd';
import { useIsMobile } from '@kne/responsive-utils';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import DefaultAppIcon from '@common/DefaultAppIcon';
import { useOpenApp } from '@common/AppEntry';
import pwaDocument from '@kne/pwa-document';
import style from './style.module.scss';

const { Text } = Typography;

const UNCATEGORIZED = '__uncategorized__';

const PwaSync = ({ apps }) => {
  useEffect(() => {
    pwaDocument.syncPwaDocument(apps, window.__APP_CENTER_PWA__);
  }, [apps]);
  return null;
};

const getCategoryCode = item => (typeof item.category === 'string' ? item.category : item.category?.code) || UNCATEGORIZED;

const AppIcon = ({ item, Image, size, themed }) => {
  if (item.icon && Image?.Avatar) {
    return <Image.Avatar id={item.icon} alt={item.label || item.name} size={size} shape="square" />;
  }
  return <DefaultAppIcon themed={themed} />;
};

const AppPanel = ({ list, groups, Image, themed }) => {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobile();
  const openApp = useOpenApp();
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const groupOrder = groups.map(group => group.code);
    const groupNames = new Map(groups.map(group => [group.code, group.name]));
    const used = new Map();
    list.forEach(item => {
      const code = getCategoryCode(item);
      if (code !== UNCATEGORIZED && !used.has(code)) {
        used.set(code, groupNames.get(code) || item.category?.name || code);
      }
    });
    const rank = code => (groupOrder.includes(code) ? groupOrder.indexOf(code) : groupOrder.length);
    const result = [...used.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([code, name]) => ({ code, name }));
    if (list.some(item => getCategoryCode(item) === UNCATEGORIZED)) {
      result.push({ code: UNCATEGORIZED, name: formatMessage({ id: 'appCenter.uncategorized' }) });
    }
    return result;
  }, [list, groups, formatMessage]);

  const filtered = useMemo(() => list.filter(item => category === 'all' || getCategoryCode(item) === category), [list, category]);

  return (
    <>
      <div className={classnames(style['panel-header'], 'app-center-header')}>
        <div className={classnames(style['tabs'], 'app-center-tabs')}>
          {[{ code: 'all', name: formatMessage({ id: 'common.all' }) }, ...categories].map(({ code, name }) => (
            <button
              type="button"
              key={code}
              className={classnames(style['tab'], 'app-center-tab', {
                [style['tab-active']]: category === code,
                'app-center-tab-active': category === code
              })}
              onClick={() => setCategory(code)}
            >
              {name}
            </button>
          ))}
        </div>
        <Text className={classnames(style['count'], 'app-center-count')}>{formatMessage({ id: 'appCenter.count' }, { value: filtered.length })}</Text>
      </div>
      {filtered.length === 0 ? (
        <Empty
          className={classnames(style['empty'], 'app-center-empty')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={formatMessage({ id: list.length ? 'appCenter.noMatch' : 'appCenter.empty' })}
        />
      ) : (
        <div className={classnames(style['grid'], 'app-center-grid')}>
          {filtered.map(item => (
            <button
              type="button"
              key={item.name}
              className={classnames(style['app'], 'app-center-app')}
              title={item.description || item.label || item.name}
              onClick={() => openApp(item)}
            >
              <div className={classnames(style['icon'], 'app-center-icon')}>
                <AppIcon item={item} Image={Image} size={isMobile ? 52 : 72} themed={themed} />
              </div>
              <div className={classnames(style['label'], 'app-center-label')}>{item.label || item.name}</div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const Center = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image']
})(
  withLocale(({ remoteModules, className, bordered = true }) => {
    const [usePreset, Image] = remoteModules;
    const { apis, getUserAccessToken } = usePreset();
    const { locale } = useIntl();
    const isLoggedIn = useMemo(() => typeof getUserAccessToken === 'function' && !!getUserAccessToken(), [getUserAccessToken]);
    const loadingView = (
      <div className={style['loading']}>
        <Spin />
      </div>
    );
    const renderApps = groups => (
      <Fetch
        {...(isLoggedIn ? apis.appManager.centerList : apis.appManager.centerPublicList)}
        render={({ data, loading }) =>
          loading ? (
            loadingView
          ) : (
            <>
              <PwaSync apps={data?.pageData || []} />
              <AppPanel list={data?.pageData || []} groups={groups} Image={Image} themed={!bordered} />
            </>
          )
        }
      />
    );

    return (
      <section
        className={classnames(
          style['panel'],
          'app-center',
          { [style['panel-borderless']]: !bordered, 'app-center-borderless': !bordered },
          className
        )}
      >
        {apis.appManager.group?.groupList ? (
          <Fetch
            {...apis.appManager.group.groupList}
            params={{ type: 'app', language: locale, output: 'list' }}
            render={({ data: groups, loading: groupsLoading }) => (groupsLoading ? loadingView : renderApps(Array.isArray(groups) ? groups : []))}
          />
        ) : (
          renderApps([])
        )}
      </section>
    );
  })
);

export default Center;
