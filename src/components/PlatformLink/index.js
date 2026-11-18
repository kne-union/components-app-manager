import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Empty, Flex, Modal, Segmented, Skeleton, Space, Tag, Tooltip, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import createAdminListCards from '@common/createAdminListCards';
import style from './style.module.scss';

const { Paragraph, Text, Title } = Typography;
const renderAdminListCards = createAdminListCards();

const STATUS_COLOR = {
  issued: 'warning',
  pending_activate: 'processing',
  paired: 'success',
  revoked: 'default',
  error: 'error'
};
const LOG_LIMIT = 200;

const formatTime = value => (value ? new Date(value).toLocaleString() : '-');
const groupKey = row => [row.action, row.result, row.statusCode, row.platformOrigin || '', row.actor || ''].join('|');

/** 新记录在前；连续同类记录合并为一行，保留最新一条的摘要 */
const groupLogs = rows => {
  const groups = [];
  for (const row of rows || []) {
    const last = groups[groups.length - 1];
    if (last && last.groupKey === groupKey(row)) {
      last.count += 1;
      last.oldestAt = row.at;
      continue;
    }
    groups.push(Object.assign({}, row, { groupKey: groupKey(row), rowId: row.id || `${row.at}-${groups.length}`, count: 1, oldestAt: row.at }));
  }
  return groups;
};

const Metric = ({ label, value, mono }) => (
  <div className={style['metric']}>
    <Text type="secondary" className={style['metric-label']}>
      {label}
    </Text>
    <Text strong className={classnames(style['metric-value'], mono && style['mono'])} ellipsis={{ tooltip: true }}>
      {value || '-'}
    </Text>
  </div>
);

/**
 * 外部应用 break-glass：登记主平台、生成 installKey、解绑、访问记录。
 * 默认打本机 /app-ops/link/*（需 APP_OPS_ENABLED）。
 */
const PlatformLink = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal', 'components-core:FormInfo', 'components-core:TablePage', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, prefix = '/app-ops', menu, menuFixed, withPage = true }) => {
    const [usePreset, useFormModal, FormInfo, TablePage, Page] = remoteModules;
    const { ajax } = usePreset();
    const ajaxRef = useRef(ajax);
    useEffect(() => {
      ajaxRef.current = ajax;
    });
    const formModal = useFormModal();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const { Input: FormInput, TextArea } = FormInfo.fields;
    const logsRef = useRef(null);
    const [platforms, setPlatforms] = useState({ loading: true, error: null, list: [] });
    const [logOrigin, setLogOrigin] = useState('');
    const [installKeyModal, setInstallKeyModal] = useState(null);

    const apis = {
      register: { url: `${prefix}/link/register`, method: 'POST' },
      unlink: { url: `${prefix}/link/unlink`, method: 'POST' },
      accessLogs: { url: `${prefix}/link/access-logs`, method: 'GET', paramsType: 'params' }
    };

    const loadPlatforms = useCallback(async () => {
      setPlatforms(prev => Object.assign({}, prev, { loading: true, error: null }));
      try {
        const { data: resData } = await ajaxRef.current({ url: `${prefix}/link/platforms`, method: 'GET' });
        if (resData?.code !== 0) {
          throw new Error(resData?.msg || formatMessage({ id: 'appManager.platformLink.loadFailed' }));
        }
        const list = resData.data?.pageData || (Array.isArray(resData.data) ? resData.data : []);
        setPlatforms({ loading: false, error: null, list });
        setLogOrigin(current => (current && !list.some(item => item.platformOrigin === current) ? '' : current));
      } catch (e) {
        setPlatforms(prev => Object.assign({}, prev, { loading: false, error: e.message || String(e) }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix]);

    useEffect(() => {
      loadPlatforms();
    }, [loadPlatforms]);

    const reloadAll = () => {
      loadPlatforms();
      logsRef.current?.reload?.();
    };

    const statusText = status =>
      Object.prototype.hasOwnProperty.call(STATUS_COLOR, status) ? formatMessage({ id: `appManager.platformLink.status.${status}` }) : status || '-';

    const openRegister = (seed = {}) => {
      formModal({
        title: formatMessage({ id: seed.platformOrigin ? 'appManager.platformLink.regenerate' : 'appManager.platformLink.registerTitle' }),
        size: 'small',
        formProps: {
          data: {
            platformOrigin: seed.platformOrigin || '',
            platformName: seed.platformName || '',
            remark: seed.remark || ''
          },
          onSubmit: async formData => {
            const { data: resData } = await ajax(
              Object.assign({}, apis.register, {
                data: {
                  platformOrigin: String(formData.platformOrigin || '').trim(),
                  platformName: formData.platformName || undefined,
                  remark: formData.remark || undefined
                }
              })
            );
            if (resData.code !== 0) {
              return false;
            }
            message.success(formatMessage({ id: 'appManager.platformLink.registerSuccess' }));
            setInstallKeyModal({
              installKey: resData.data.installKey,
              platformOrigin: resData.data.platformOrigin,
              expiresAt: resData.data.expiresAt
            });
            reloadAll();
          }
        },
        children: (
          <FormInfo
            column={1}
            list={[
              <FormInput name="platformOrigin" label={formatMessage({ id: 'appManager.platformLink.platformOrigin' })} rule="REQ" />,
              <FormInput name="platformName" label={formatMessage({ id: 'appManager.platformLink.platformName' })} />,
              <TextArea name="remark" label={formatMessage({ id: 'appManager.platformLink.remark' })} autoSize={{ minRows: 2, maxRows: 4 }} />
            ]}
          />
        )
      });
    };

    const unlink = row => {
      modal.confirm({
        title: formatMessage({ id: 'appManager.platformLink.unlinkTitle' }),
        content: formatMessage({ id: 'appManager.platformLink.unlinkConfirm' }, { origin: row.platformOrigin }),
        okButtonProps: { danger: true },
        okText: formatMessage({ id: 'appManager.platformLink.unlink' }),
        onOk: async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.unlink, { data: { platformOrigin: row.platformOrigin } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'appManager.platformLink.unlinkSuccess' }));
          reloadAll();
        }
      });
    };

    const renderPlatform = item => {
      const notice = {
        issued: 'appManager.platformLink.notice.issued',
        pending_activate: 'appManager.platformLink.notice.pending_activate',
        error: 'appManager.platformLink.notice.error'
      }[item.status];
      return (
        <section key={item.platformOrigin} className={classnames(style['platform'], style[`platform-${item.status || 'unknown'}`])}>
          <Flex justify="space-between" align="flex-start" gap={12} wrap="wrap">
            <div className={style['platform-titles']}>
              <Flex align="center" gap={8} wrap="wrap">
                <Title level={5} className={style['platform-title']}>
                  {item.platformName || item.platformOrigin}
                </Title>
                <Tag color={STATUS_COLOR[item.status] || 'default'} bordered={false}>
                  {statusText(item.status)}
                </Tag>
              </Flex>
              <Text type="secondary" className={style['platform-origin']}>
                {item.platformOrigin}
              </Text>
            </div>
            <Space size={8} wrap>
              {item.status !== 'paired' ? (
                <Button onClick={() => openRegister(item)}>{formatMessage({ id: 'appManager.platformLink.regenerate' })}</Button>
              ) : null}
              <Button danger onClick={() => unlink(item)}>
                {formatMessage({ id: 'appManager.platformLink.unlink' })}
              </Button>
            </Space>
          </Flex>
          {notice ? <Alert className={style['platform-notice']} type={item.status === 'error' ? 'error' : 'info'} showIcon message={formatMessage({ id: notice })} /> : null}
          <div className={style['metrics']}>
            <Metric label={formatMessage({ id: 'appManager.platformLink.issuer' })} value={item.issuer} mono />
            {item.status === 'issued' ? (
              <Metric label={formatMessage({ id: 'appManager.platformLink.expiresAt' })} value={formatTime(item.expiresAt)} />
            ) : (
              <Metric label={formatMessage({ id: 'appManager.platformLink.pairedAt' })} value={formatTime(item.pairedAt)} />
            )}
            <Metric label={formatMessage({ id: 'appManager.platformLink.lastAccessAt' })} value={formatTime(item.lastAccessAt)} />
          </div>
          {item.remark ? (
            <Text type="secondary" className={style['platform-remark']}>
              {formatMessage({ id: 'appManager.platformLink.remark' })}：{item.remark}
            </Text>
          ) : null}
        </section>
      );
    };

    const renderPlatformsBody = () => {
      if (platforms.loading && !platforms.list.length) {
        return <Skeleton active paragraph={{ rows: 3 }} />;
      }
      if (platforms.error) {
        return (
          <Flex align="center" gap={12}>
            <Text type="danger">{platforms.error}</Text>
            <Button size="small" onClick={loadPlatforms}>
              {formatMessage({ id: 'appManager.platformLink.retry' })}
            </Button>
          </Flex>
        );
      }
      if (!platforms.list.length) {
        return (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'appManager.platformLink.emptyPlatforms' })}>
            <Text type="secondary" className={style['empty-hint']}>
              {formatMessage({ id: 'appManager.platformLink.hint' })}
            </Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openRegister()}>
              {formatMessage({ id: 'appManager.platformLink.register' })}
            </Button>
          </Empty>
        );
      }
      return <div className={style['platform-list']}>{platforms.list.map(renderPlatform)}</div>;
    };

    const logColumns = [
      {
        name: 'at',
        title: formatMessage({ id: 'appManager.linkAudit.at' }),
        getValueOf: item => item,
        render: item => (
          <Tooltip title={item.count > 1 ? `${formatTime(item.oldestAt)} – ${formatTime(item.at)}` : formatTime(item.at)}>
            <span className={style['log-time']}>{formatTime(item.at)}</span>
          </Tooltip>
        )
      },
      !logOrigin && {
        name: 'platformOrigin',
        title: formatMessage({ id: 'appManager.platformLink.platformOrigin' }),
        getValueOf: item => item.platformOrigin || '-'
      },
      {
        name: 'action',
        title: formatMessage({ id: 'appManager.linkAudit.action' }),
        getValueOf: item => item,
        render: item => (
          <Space size={6} className={style['log-action']}>
            <span>{item.action || '-'}</span>
            {item.count > 1 ? <Tag bordered={false}>{formatMessage({ id: 'appManager.platformLink.repeat' }, { count: item.count })}</Tag> : null}
          </Space>
        )
      },
      {
        name: 'result',
        title: formatMessage({ id: 'appManager.linkAudit.result' }),
        getValueOf: item => item.result,
        render: value => (
          <Tag color={value === 'ok' ? 'success' : 'error'} bordered={false}>
            {value || '-'}
          </Tag>
        )
      },
      {
        name: 'statusCode',
        title: formatMessage({ id: 'appManager.linkAudit.statusCode' }),
        getValueOf: item => item.statusCode || '-'
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
    ].filter(Boolean);

    const titleExtra = (
      <Space size={8}>
        <Button icon={<ReloadOutlined />} onClick={reloadAll}>
          {formatMessage({ id: 'common.refresh' })}
        </Button>
        {platforms.list.length ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openRegister()}>
            {formatMessage({ id: 'appManager.platformLink.register' })}
          </Button>
        ) : null}
      </Space>
    );

    const body = (
      <>
        <div className={style['page']}>
          <section className={style['section']}>{renderPlatformsBody()}</section>

          <section className={style['section']}>
            <div className={style['section-header']}>
              <div className={style['section-title']}>{formatMessage({ id: 'appManager.platformLink.accessLogs' })}</div>
              {platforms.list.length > 0 ? (
                <Segmented
                  value={logOrigin}
                  onChange={setLogOrigin}
                  options={[{ value: '', label: formatMessage({ id: 'common.all' }) }].concat(
                    platforms.list.map(item => ({ value: item.platformOrigin, label: item.platformName || item.platformOrigin }))
                  )}
                />
              ) : null}
            </div>
            <TablePage
              {...Object.assign({}, apis.accessLogs, {
                params: Object.assign({ limit: LOG_LIMIT }, logOrigin ? { platformOrigin: logOrigin } : {})
              })}
              key={logOrigin || 'all'}
              ref={logsRef}
              name="app-ops-access-logs"
              rowKey="rowId"
              controllerOpen={false}
              pagination={{ open: false }}
              transformData={data => {
                const pageData = groupLogs(data?.pageData || []);
                return { pageData, totalCount: pageData.length };
              }}
              renderMobile={renderAdminListCards}
              columns={logColumns}
            />
          </section>
        </div>

        <Modal
          title={formatMessage({ id: 'appManager.platformLink.installKeyTitle' })}
          open={!!installKeyModal}
          onCancel={() => setInstallKeyModal(null)}
          maskClosable={false}
          footer={[
            <Button key="close" type="primary" onClick={() => setInstallKeyModal(null)}>
              {formatMessage({ id: 'appManager.platformLink.installKeyDone' })}
            </Button>
          ]}
          destroyOnHidden
          width={600}
        >
          {installKeyModal ? (
            <Flex vertical gap={12}>
              <Alert type="warning" showIcon message={formatMessage({ id: 'appManager.platformLink.installKeyOnce' })} />
              <Text type="secondary">
                {installKeyModal.platformOrigin} · {formatMessage({ id: 'appManager.platformLink.expiresAt' })}：{formatTime(installKeyModal.expiresAt)}
              </Text>
              <Paragraph className={style['install-key']} copyable={{ text: installKeyModal.installKey }}>
                {installKeyModal.installKey}
              </Paragraph>
            </Flex>
          ) : null}
        </Modal>
      </>
    );

    if (!withPage) {
      return body;
    }

    return (
      <Page title={formatMessage({ id: 'appManager.platformLink.title' })} menu={menu} menuFixed={menuFixed} titleExtra={titleExtra}>
        {body}
      </Page>
    );
  })
);

export default PlatformLink;
