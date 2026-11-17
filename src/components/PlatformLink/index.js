import { useRef, useState } from 'react';
import { Alert, App, Button, Input, Modal, Space, Tag, Typography } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import createAdminListCards from '@common/createAdminListCards';

const { Paragraph, Text } = Typography;
const renderAdminListCards = createAdminListCards();
const formatTime = value => (value ? new Date(value).toLocaleString() : '-');

const STATUS_COLOR = {
  issued: 'orange',
  pending_activate: 'blue',
  paired: 'green',
  revoked: 'default',
  error: 'red'
};

/**
 * 远程应用 break-glass：登记主平台、生成 installKey、解绑、访问记录。
 * 默认打本机 /app-ops/link/*（需 APP_OPS_ENABLED）。
 */
const PlatformLink = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:FormInfo@useFormModal', 'components-core:FormInfo', 'components-core:TablePage', 'components-core:Layout@Page']
})(
  withLocale(({ remoteModules, prefix = '/app-ops' }) => {
    const [usePreset, useFormModal, FormInfo, TablePage, Page] = remoteModules;
    const { ajax } = usePreset();
    const formModal = useFormModal();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const { Input: FormInput, TextArea } = FormInfo.fields;
    const platformsRef = useRef(null);
    const logsRef = useRef(null);
    const [filterOrigin, setFilterOrigin] = useState(undefined);
    const [installKeyModal, setInstallKeyModal] = useState(null);

    const apis = {
      platforms: { url: `${prefix}/link/platforms`, method: 'GET' },
      register: { url: `${prefix}/link/register`, method: 'POST' },
      unlink: { url: `${prefix}/link/unlink`, method: 'POST' },
      accessLogs: { url: `${prefix}/link/access-logs`, method: 'GET', paramsType: 'params' }
    };

    const reloadAll = () => {
      platformsRef.current?.reload?.();
      logsRef.current?.reload?.();
    };

    const showInstallKey = data => {
      setInstallKeyModal({
        installKey: data.installKey,
        platformOrigin: data.platformOrigin,
        expiresAt: data.expiresAt
      });
    };

    const openRegister = (seed = {}) => {
      formModal({
        title: formatMessage({ id: 'appManager.platformLink.registerTitle' }),
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
            showInstallKey(resData.data);
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
        onOk: async () => {
          const { data: resData } = await ajax(Object.assign({}, apis.unlink, { data: { platformOrigin: row.platformOrigin } }));
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'appManager.platformLink.unlinkSuccess' }));
          if (filterOrigin === row.platformOrigin) {
            setFilterOrigin(undefined);
          }
          reloadAll();
        }
      });
    };

    return (
      <Page title={formatMessage({ id: 'appManager.platformLink.title' })}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert type="info" showIcon message={formatMessage({ id: 'appManager.platformLink.hint' })} />
          <TablePage
            {...apis.platforms}
            ref={platformsRef}
            name="app-ops-platforms"
            rowKey="platformOrigin"
            controllerOpen={false}
            pagination={{ open: false }}
            transformData={data => ({
              pageData: data?.pageData || (Array.isArray(data) ? data : []),
              totalCount: (data?.pageData || (Array.isArray(data) ? data : [])).length
            })}
            renderMobile={renderAdminListCards}
            renderCard={renderAdminListCards}
            buttonGroup={{
              list: [
                {
                  type: 'primary',
                  children: formatMessage({ id: 'appManager.platformLink.register' }),
                  onClick: () => openRegister()
                },
                {
                  children: formatMessage({ id: 'common.refresh' }),
                  onClick: reloadAll
                }
              ]
            }}
            columns={[
              {
                name: 'platformName',
                title: formatMessage({ id: 'appManager.platformLink.platformName' }),
                renderType: 'main',
                getValueOf: item => item.platformName || item.platformOrigin
              },
              {
                name: 'platformOrigin',
                title: formatMessage({ id: 'appManager.platformLink.platformOrigin' }),
                getValueOf: item => item.platformOrigin
              },
              {
                name: 'issuer',
                title: formatMessage({ id: 'appManager.platformLink.issuer' }),
                getValueOf: item => item.issuer || '-'
              },
              {
                name: 'status',
                title: formatMessage({ id: 'common.status' }),
                getValueOf: item => item.status,
                render: value => {
                  const statusId = `appManager.platformLink.status.${value}`;
                  const label = ['issued', 'pending_activate', 'paired', 'revoked', 'error'].includes(value)
                    ? formatMessage({ id: statusId })
                    : value || '-';
                  return <Tag color={STATUS_COLOR[value] || 'default'}>{label}</Tag>;
                }
              },
              {
                name: 'expiresAt',
                title: formatMessage({ id: 'appManager.platformLink.expiresAt' }),
                getValueOf: item => (item.status === 'issued' ? formatTime(item.expiresAt) : '-')
              },
              {
                name: 'lastAccessAt',
                title: formatMessage({ id: 'appManager.platformLink.lastAccessAt' }),
                getValueOf: item => formatTime(item.lastAccessAt)
              },
              {
                name: 'pairedAt',
                title: formatMessage({ id: 'appManager.platformLink.pairedAt' }),
                getValueOf: item => formatTime(item.pairedAt)
              },
              {
                name: 'options',
                title: formatMessage({ id: 'appManager.version.actions' }),
                renderType: 'options',
                fixed: 'right',
                getValueOf: item => [
                  {
                    type: 'link',
                    children: formatMessage({ id: 'appManager.platformLink.regenerate' }),
                    onClick: () => openRegister(item)
                  },
                  {
                    type: 'link',
                    children: formatMessage({ id: 'appManager.platformLink.filterLogs' }),
                    onClick: () => setFilterOrigin(item.platformOrigin)
                  },
                  {
                    type: 'link',
                    danger: true,
                    children: formatMessage({ id: 'appManager.platformLink.unlink' }),
                    onClick: () => unlink(item)
                  }
                ]
              }
            ]}
          />

          <Space align="center" wrap>
            <Text strong>{formatMessage({ id: 'appManager.platformLink.accessLogs' })}</Text>
            {filterOrigin ? (
              <>
                <Tag closable onClose={() => setFilterOrigin(undefined)}>
                  {filterOrigin}
                </Tag>
              </>
            ) : (
              <Text type="secondary">{formatMessage({ id: 'appManager.platformLink.accessLogsHint' })}</Text>
            )}
          </Space>
          <TablePage
            {...Object.assign({}, apis.accessLogs, {
              params: Object.assign({ limit: 50 }, filterOrigin ? { platformOrigin: filterOrigin } : {})
            })}
            ref={logsRef}
            name="app-ops-access-logs"
            rowKey={row => `${row.at}-${row.action}-${row.platformOrigin || ''}`}
            controllerOpen={false}
            pagination={{ pageSize: 50 }}
            renderMobile={renderAdminListCards}
            renderCard={renderAdminListCards}
            columns={[
              {
                name: 'at',
                title: formatMessage({ id: 'appManager.linkAudit.at' }),
                getValueOf: item => formatTime(item.at)
              },
              {
                name: 'platformOrigin',
                title: formatMessage({ id: 'appManager.platformLink.platformOrigin' }),
                getValueOf: item => item.platformOrigin || '-'
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
        </Space>

        <Modal
          title={formatMessage({ id: 'appManager.platformLink.installKeyTitle' })}
          open={!!installKeyModal}
          onCancel={() => setInstallKeyModal(null)}
          footer={[
            <Button key="close" type="primary" onClick={() => setInstallKeyModal(null)}>
              {formatMessage({ id: 'common.close' })}
            </Button>
          ]}
          destroyOnHidden
          width={640}
        >
          {installKeyModal ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Alert type="warning" showIcon message={formatMessage({ id: 'appManager.platformLink.installKeyOnce' })} />
              <Text type="secondary">
                {installKeyModal.platformOrigin} · {formatMessage({ id: 'appManager.platformLink.expiresAt' })}: {formatTime(installKeyModal.expiresAt)}
              </Text>
              <Paragraph copyable={{ text: installKeyModal.installKey }}>
                <Input.TextArea value={installKeyModal.installKey} readOnly autoSize={{ minRows: 4, maxRows: 8 }} />
              </Paragraph>
            </Space>
          ) : null}
        </Modal>
      </Page>
    );
  })
);

export default PlatformLink;
