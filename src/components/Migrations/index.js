import { useRef, useState } from 'react';
import { Alert, App, Button, Drawer, Input, Space, Typography } from 'antd';
import { createWithRemoteLoader } from '@kne/remote-loader';
import withLocale from '@common/withLocale';
import { useIntl } from '@kne/react-intl';
import createAdminListCards from '@common/createAdminListCards';
import { MigrationStatus } from '@common/AppActions/MigrationManager';

const { Text } = Typography;
const renderAdminListCards = createAdminListCards();
const SQL_FILE_NAME_RE = /^[A-Za-z0-9_\-.]+\.sql$/;
const formatTime = value => (value ? new Date(value).toLocaleString() : '-');

/**
 * 迁移脚本 Tab：managed 需 versionId；linked 不传 versionId，代理远程 server/sql。
 * linked 默认只读列表 + 执行（不支持新增/删文件，文件在远程磁盘）。
 */
const Migrations = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-thirdparty:CodeEditor', 'components-core:TablePage']
})(
  withLocale(({ remoteModules, data, versionId: versionIdProp }) => {
    const [usePreset, CodeEditor, TablePage] = remoteModules;
    const { ajax, apis } = usePreset();
    const { message, modal } = App.useApp();
    const { formatMessage } = useIntl();
    const [editor, setEditor] = useState(null);
    const [saving, setSaving] = useState(false);
    const tableRef = useRef(null);
    const appName = data?.name;
    const linked = data?.kind === 'linked';
    const versionId = linked ? undefined : versionIdProp || data?.currentVersionId || data?.versionId;
    const canEditFiles = !linked;

    const reload = () => tableRef.current?.reload?.();

    const params = linked ? { name: appName } : { name: appName, versionId };

    const request = async (api, payload) => {
      const { data: resData } = await ajax(Object.assign({}, api, { data: Object.assign({}, params, payload) }));
      return resData.code === 0 ? resData : null;
    };

    const confirmAction = ({ content, danger, onOk }) => {
      modal.confirm({
        title: formatMessage({ id: 'appManager.migration.confirmTitle' }),
        content,
        okButtonProps: danger ? { danger: true } : undefined,
        onOk
      });
    };

    const openEditor = async item => {
      if (!item) {
        setEditor({ isNew: true, file: '', content: '', executed: false });
        return;
      }
      const { data: resData } = await ajax(Object.assign({}, apis.appManager.migrationContent, { params: Object.assign({}, params, { file: item.name }) }));
      if (resData.code !== 0) {
        return;
      }
      setEditor({ isNew: false, file: item.name, content: resData.data.content || '', executed: !!item.executed });
    };

    const saveEditor = async () => {
      const file = String(editor.file || '').trim();
      if (!SQL_FILE_NAME_RE.test(file) || file.includes('..')) {
        message.error(formatMessage({ id: 'appManager.migration.fileNameInvalid' }));
        return;
      }
      if (!String(editor.content || '').trim()) {
        message.error(formatMessage({ id: 'appManager.migration.contentEmpty' }));
        return;
      }
      setSaving(true);
      try {
        const res = await request(apis.appManager.migrationSave, { file, content: editor.content });
        if (!res) {
          return;
        }
        message.success(formatMessage({ id: 'common.saveSuccess' }));
        reload();
        setEditor(null);
      } finally {
        setSaving(false);
      }
    };

    const runAction = (item, action) => {
      confirmAction({
        content: formatMessage({ id: `appManager.migration.${action}Confirm` }, { file: item.name }),
        onOk: async () => {
          const res = await request(apis.appManager.migrationAction, { file: item.name, action });
          if (!res) {
            return;
          }
          message.success(formatMessage({ id: `appManager.migration.${action}Success` }));
          reload();
        }
      });
    };

    const removeFile = item => {
      confirmAction({
        danger: true,
        content: formatMessage({ id: 'appManager.migration.removeConfirm' }, { file: item.name }),
        onOk: async () => {
          const res = await request(apis.appManager.migrationRemove, { file: item.name });
          if (!res) {
            return;
          }
          message.success(formatMessage({ id: 'appManager.migration.removeSuccess' }));
          reload();
        }
      });
    };

    if (!linked && !versionId) {
      return <Alert type="info" showIcon message={formatMessage({ id: 'appManager.migration.needVersion' })} />;
    }

    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={formatMessage({ id: linked ? 'appManager.migration.linkedHint' : 'appManager.migration.sharedHint' })}
        />
        <TablePage
          {...Object.assign({}, apis.appManager.migrationList, { params })}
          ref={tableRef}
          name="admin-app-manager-migrations-tab"
          rowKey="name"
          controllerOpen={false}
          pagination={{ open: false }}
          renderMobile={renderAdminListCards}
          renderCard={renderAdminListCards}
          summary={({ data: listData }) =>
            listData?.dbError ? <Alert type="error" showIcon message={formatMessage({ id: 'appManager.migration.dbError' }, { error: listData.dbError })} /> : null
          }
          buttonGroup={{
            list: [
              canEditFiles
                ? {
                    type: 'primary',
                    children: formatMessage({ id: 'appManager.migration.add' }),
                    onClick: () => openEditor(null)
                  }
                : null,
              {
                children: formatMessage({ id: 'common.refresh' }),
                onClick: reload
              }
            ].filter(Boolean)
          }}
          columns={listData => [
            {
              name: 'name',
              title: formatMessage({ id: 'appManager.migration.file' }),
              renderType: 'main',
              getValueOf: item => item.name
            },
            {
              name: 'status',
              title: formatMessage({ id: 'appManager.migration.status' }),
              getValueOf: item => item.name,
              render: (_, { dataSource }) => <MigrationStatus item={dataSource} formatMessage={formatMessage} />
            },
            {
              name: 'updatedAt',
              title: formatMessage({ id: 'appManager.migration.updatedAt' }),
              getValueOf: item => formatTime(item.updatedAt)
            },
            {
              name: 'options',
              title: formatMessage({ id: 'appManager.version.actions' }),
              renderType: 'options',
              fixed: 'right',
              getValueOf: item => {
                const statusKnown = !listData?.dbError;
                const list = [
                  {
                    type: 'link',
                    children: formatMessage({ id: canEditFiles ? 'common.edit' : 'common.view' }),
                    onClick: () => openEditor(item)
                  }
                ];
                if (statusKnown && !item.executed) {
                  list.push(
                    {
                      type: 'link',
                      children: formatMessage({ id: 'appManager.migration.execute' }),
                      onClick: () => runAction(item, 'execute')
                    },
                    {
                      type: 'link',
                      children: formatMessage({ id: 'appManager.migration.mark' }),
                      onClick: () => runAction(item, 'mark')
                    }
                  );
                }
                if (statusKnown && item.executed) {
                  list.push({
                    type: 'link',
                    children: formatMessage({ id: 'appManager.migration.unmark' }),
                    onClick: () => runAction(item, 'unmark')
                  });
                }
                if (canEditFiles) {
                  list.push({
                    type: 'link',
                    danger: true,
                    children: formatMessage({ id: 'common.delete' }),
                    onClick: () => removeFile(item)
                  });
                }
                return list;
              }
            }
          ]}
        />
        <Drawer
          title={formatMessage({ id: editor?.isNew ? 'appManager.migration.addTitle' : 'appManager.migration.editTitle' })}
          width={820}
          open={!!editor}
          onClose={() => setEditor(null)}
          destroyOnHidden
          footer={
            canEditFiles ? (
              <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditor(null)}>{formatMessage({ id: 'common.cancel' })}</Button>
                <Button type="primary" loading={saving} onClick={saveEditor}>
                  {formatMessage({ id: 'common.save' })}
                </Button>
              </Space>
            ) : (
              <Button onClick={() => setEditor(null)}>{formatMessage({ id: 'common.close' })}</Button>
            )
          }
        >
          {editor ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {editor.executed ? <Alert type="warning" showIcon message={formatMessage({ id: 'appManager.migration.editExecutedHint' })} /> : null}
              <Input
                addonBefore={formatMessage({ id: 'appManager.migration.file' })}
                value={editor.file}
                disabled={!editor.isNew || !canEditFiles}
                placeholder={formatMessage({ id: 'appManager.migration.fileNamePlaceholder' })}
                onChange={e => setEditor(prev => Object.assign({}, prev, { file: e.target.value }))}
              />
              <CodeEditor
                height={420}
                defaultLanguage="sql"
                value={editor.content}
                onChange={value => (canEditFiles ? setEditor(prev => Object.assign({}, prev, { content: value == null ? '' : String(value) })) : undefined)}
                options={{
                  fontSize: 13,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly: !canEditFiles
                }}
              />
              {!canEditFiles ? <Text type="secondary">{formatMessage({ id: 'appManager.migration.linkedReadOnly' })}</Text> : null}
            </Space>
          ) : null}
        </Drawer>
      </Space>
    );
  })
);

export default Migrations;
