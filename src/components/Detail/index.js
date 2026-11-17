import { Empty } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useNavigate, useSearchParams } from 'react-router-dom';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import Actions from '@common/AppActions';
import LifecycleBar from './LifecycleBar';
import Overview from '@components/Overview';
import Versions from '@components/Versions';
import OpenApi from '@components/OpenApi';
import Env from '@components/Env';
import DataOps from '@components/DataOps';
import Logs from '@components/Logs';
import Settings from '@components/Settings';
import Migrations from '@components/Migrations';
import LinkAudit from '@components/LinkAudit';
import DeployingStatusPoller from './DeployingStatusPoller';
import DetailPageHeaderTitle from '@common/DetailPageHeaderTitle';
import style from './style.module.scss';

const Detail = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Layout@StateBarPage', 'components-core:Layout@PageHeader']
})(
  withLocale(({ remoteModules, baseUrl, name: nameProp, ...props }) => {
    const [usePreset, StateBarPage, PageHeader] = remoteModules;
    const { apis } = usePreset();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { formatMessage } = useIntl();
    const name = nameProp || searchParams.get('name');

    if (!name) {
      return <Empty description={formatMessage({ id: 'appManager.detail.missingName' })} />;
    }

    return (
      <Fetch
        {...Object.assign({}, apis.appManager.detail, {
          params: { name }
        })}
        render={({ data, reload }) => {
          const activeKey = searchParams.get('tab') || 'overview';

          let content = <Empty description={formatMessage({ id: 'appManager.detail.notFound' })} />;
          if (data) {
            if (activeKey === 'versions') {
              content = <Versions data={data} onSuccess={reload} />;
            } else if (activeKey === 'env') {
              content = <Env data={data} onSuccess={reload} readOnly={data.kind === 'linked'} />;
            } else if (activeKey === 'data') {
              content = <DataOps data={data} onSuccess={reload} />;
            } else if (activeKey === 'logs') {
              content = <Logs data={data} />;
            } else if (activeKey === 'openApi') {
              content = <OpenApi data={data} />;
            } else if (activeKey === 'settings' && data.kind !== 'linked') {
              content = <Settings data={data} onSuccess={reload} />;
            } else if (activeKey === 'migrations') {
              content = <Migrations data={data} />;
            } else if (activeKey === 'linkAudit' && data.kind === 'linked') {
              content = <LinkAudit data={data} />;
            } else {
              content = <Overview data={data} />;
            }
          }

          return (
            <div className={style['detail-page']}>
              <DeployingStatusPoller active={data?.status === 'deploying' || !!data?.deployment} reload={reload} />
              <StateBarPage
                {...props}
                name="admin-app-manager-detail"
                headerFixed={false}
                header={
                  data ? (
                    <div className={style['detail-header']}>
                      <PageHeader
                        title={<DetailPageHeaderTitle baseUrl={baseUrl} title={data.label || data.name || formatMessage({ id: 'common.loading' })} />}
                        info={data.name}
                        tags={undefined}
                        buttonOptions={
                          <Actions
                            data={data}
                            onSuccess={reload}
                            onRemoveSuccess={() => navigate(baseUrl, { replace: true })}
                            includeLifecycle={false}
                            place="end"
                          />
                        }
                      />
                      {data.kind === 'linked' ? null : <LifecycleBar data={data} onSuccess={reload} />}
                    </div>
                  ) : (
                    <PageHeader title={<DetailPageHeaderTitle baseUrl={baseUrl} title={formatMessage({ id: 'common.loading' })} />} />
                  )
                }
                stateBar={{
                  activeKey,
                  onChange: key => {
                    const next = new URLSearchParams(searchParams);
                    next.set('tab', key);
                    setSearchParams(next, { replace: true });
                  },
                  stateOption: [
                    { tab: formatMessage({ id: 'appManager.tabs.overview' }), key: 'overview' },
                    data.kind === 'linked'
                      ? null
                      : { tab: formatMessage({ id: 'appManager.tabs.versions' }), key: 'versions' },
                    { tab: formatMessage({ id: 'appManager.tabs.openApi' }), key: 'openApi' },
                    { tab: formatMessage({ id: 'appManager.tabs.env' }), key: 'env' },
                    { tab: formatMessage({ id: 'appManager.tabs.data' }), key: 'data' },
                    { tab: formatMessage({ id: 'appManager.tabs.migrations' }), key: 'migrations' },
                    { tab: formatMessage({ id: 'appManager.tabs.logs' }), key: 'logs' },
                    data.kind === 'linked'
                      ? { tab: formatMessage({ id: 'appManager.tabs.linkAudit' }), key: 'linkAudit' }
                      : null,
                    data.kind === 'linked'
                      ? null
                      : { tab: formatMessage({ id: 'appManager.tabs.settings' }), key: 'settings' }
                  ].filter(Boolean)
                }}
              >
                {content}
              </StateBarPage>
            </div>
          );
        }}
      />
    );
  })
);

export default Detail;
