import classnames from 'classnames';
import { Flex, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { createWithRemoteLoader } from '@kne/remote-loader';
import { useIsMobile } from '@kne/responsive-utils';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import DefaultAppIcon from '@common/DefaultAppIcon';
import { OpenAppLink } from '@common/AppEntry';
import StatusTag from '@common/StatusTag';
import LoadCard from './LoadCard';
import style from './style.module.scss';

const { Text, Paragraph, Title } = Typography;

const display = value => {
  if (value === 0) {
    return '0';
  }
  return value || '-';
};

const FieldRow = ({ label, children, mono }) => (
  <div className={style['field-row']}>
    <Text type="secondary" className={style['field-label']}>
      {label}
    </Text>
    <div className={classnames(style['field-value'], mono && style['mono'])}>{children}</div>
  </div>
);

const formatTime = value => (value ? new Date(value).toLocaleString() : '-');

const Metric = ({ label, value, mono }) => (
  <div className={style['metric']}>
    <Text type="secondary" className={style['metric-label']}>
      {label}
    </Text>
    <Text strong className={classnames(style['metric-value'], mono && style['mono'])} ellipsis={{ tooltip: true }}>
      {display(value)}
    </Text>
  </div>
);

const Overview = createWithRemoteLoader({
  modules: ['components-core:Image']
})(
  withLocale(({ remoteModules, data }) => {
    const [Image] = remoteModules;
    const { formatMessage } = useIntl();
    const isMobile = useIsMobile();
    const title = data.label || data.name;
    const linked = data.kind === 'linked';
    const linkOptions = data.options || {};
    const linkStatus = linkOptions.linkStatus;
    const linkStatusText = linkStatus ? formatMessage({ id: `appManager.platformLink.status.${linkStatus}`, defaultMessage: linkStatus }) : null;

    return (
      <div className={style['overview']}>
        <section className={classnames(style['hero'], style[`hero-${data.status || 'idle'}`])}>
          <Flex gap={isMobile ? 14 : 20} align="flex-start" className={style['hero-main']}>
            <div className={style['hero-icon']}>
              {data.icon && Image?.Avatar ? <Image.Avatar id={data.icon} alt={title} size={isMobile ? 64 : 80} shape="square" /> : <DefaultAppIcon />}
            </div>
            <div className={style['hero-body']}>
              <Flex justify="space-between" align="flex-start" gap={12} wrap="wrap">
                <div className={style['hero-titles']}>
                  <Title level={4} className={style['hero-title']}>
                    {title}
                  </Title>
                  <Text type="secondary" className={style['hero-name']}>
                    {data.name}
                  </Text>
                </div>
                <StatusTag status={data.status} deployment={data.deployment} />
              </Flex>
              {linked && data.message ? (
                <Text type="danger" className={style['hero-message']}>
                  {data.message}
                </Text>
              ) : null}
              <Paragraph type="secondary" className={style['hero-desc']} ellipsis={{ rows: 2 }}>
                {data.description || formatMessage({ id: 'appManager.list.noDescription' })}
              </Paragraph>
              <OpenAppLink app={data} className={style['open-link']}>
                <ExportOutlined />
                <span>{formatMessage({ id: 'appManager.list.openApp' })}</span>
              </OpenAppLink>
            </div>
          </Flex>

          <div className={style['metrics']}>
            {linked ? (
              <>
                <Metric label={formatMessage({ id: 'appManager.overview.remoteUrl' })} value={linkOptions.baseUrl} mono />
                <Metric label={formatMessage({ id: 'appManager.overview.linkStatus' })} value={linkStatusText} />
                <Metric label={formatMessage({ id: 'appManager.overview.syncedAt' })} value={formatTime(linkOptions.permissionsSyncedAt)} />
              </>
            ) : (
              <>
                <Metric label={formatMessage({ id: 'appManager.columns.port' })} value={data.port} />
                <Metric label={formatMessage({ id: 'appManager.detail.currentVersion' })} value={data.currentVersionId} mono />
                <Metric label={formatMessage({ id: 'appManager.detail.pm2Name' })} value={data.pm2Name} mono />
              </>
            )}
          </div>

          {!linked && (data.status === 'deploying' || data.deployment) ? (
            <Text type="secondary" className={style['deploying-hint']}>
              {formatMessage({ id: 'appManager.detail.deployingHint' })}
            </Text>
          ) : null}
        </section>

        {/* linked 无本机 PM2 进程，实时负载不适用 */}
        {linked ? null : <LoadCard data={data} />}

        <section className={style['detail-card']}>
          <div className={style['detail-card-title']}>{formatMessage({ id: 'appManager.detail.sectionMore' })}</div>
          <div className={style['field-list']}>
            <FieldRow label={formatMessage({ id: 'appManager.columns.pathUrl' })}>
              {data.pathUrl ? <OpenAppLink app={data}>{data.pathUrl}</OpenAppLink> : '-'}
            </FieldRow>
            {linked ? (
              <FieldRow label={formatMessage({ id: 'appManager.overview.oidcClient' })} mono>
                {display(linkOptions.oidc?.clientId)}
              </FieldRow>
            ) : (
              <FieldRow label={formatMessage({ id: 'appManager.columns.domain' })}>{display(data.domain)}</FieldRow>
            )}
            <FieldRow label={formatMessage({ id: 'appManager.columns.message' })}>{display(data.message)}</FieldRow>
          </div>
        </section>
      </div>
    );
  })
);

export default Overview;
