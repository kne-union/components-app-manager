import { useRef } from 'react';
import { Tag } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import createAdminListCards from '@common/createAdminListCards';

const renderAdminListCards = createAdminListCards();
const formatTime = value => (value ? new Date(value).toLocaleString() : '-');

/** 主平台侧：谁通过代理打了远程 /app-ops */
const LinkAudit = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:TablePage']
})(
  withLocale(({ remoteModules, data }) => {
    const [usePreset, TablePage] = remoteModules;
    const { apis } = usePreset();
    const { formatMessage } = useIntl();
    const tableRef = useRef(null);
    const appName = data?.name;

    const auditApi = Object.assign({}, apis.appManager.linkAudit, {
      url: String(apis.appManager.linkAudit.url || '').replace('{name}', encodeURIComponent(appName || '')),
      params: { limit: 50 }
    });

    return (
      <TablePage
        {...auditApi}
        ref={tableRef}
        name="admin-app-manager-link-audit"
        rowKey={row => `${row.at}-${row.action}-${row.actor || ''}`}
        controllerOpen={false}
        pagination={{ pageSize: 50 }}
        renderMobile={renderAdminListCards}
        renderCard={renderAdminListCards}
        buttonGroup={{
          list: [
            {
              children: formatMessage({ id: 'common.refresh' }),
              onClick: () => tableRef.current?.reload?.()
            }
          ]
        }}
        columns={[
          {
            name: 'at',
            title: formatMessage({ id: 'appManager.linkAudit.at' }),
            getValueOf: item => formatTime(item.at)
          },
          {
            name: 'action',
            title: formatMessage({ id: 'appManager.linkAudit.action' }),
            getValueOf: item => item.action
          },
          {
            name: 'result',
            title: formatMessage({ id: 'appManager.linkAudit.result' }),
            getValueOf: item => item.result,
            render: value => <Tag color={value === 'ok' ? 'green' : 'red'}>{value || '-'}</Tag>
          },
          {
            name: 'statusCode',
            title: formatMessage({ id: 'appManager.linkAudit.statusCode' }),
            getValueOf: item => item.statusCode
          },
          {
            name: 'actor',
            title: formatMessage({ id: 'appManager.linkAudit.actor' }),
            getValueOf: item => item.actor || '-'
          },
          {
            name: 'detail',
            title: formatMessage({ id: 'appManager.linkAudit.detail' }),
            getValueOf: item => item.detail || '-'
          }
        ]}
      />
    );
  })
);

export default LinkAudit;
