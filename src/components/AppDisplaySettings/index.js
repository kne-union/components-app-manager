import { useMemo, useState } from 'react';
import { App, Button, Empty, Input, Modal, Segmented, Spin, Tag, Tooltip, Typography } from 'antd';
import classnames from 'classnames';
import { createWithRemoteLoader } from '@kne/remote-loader';
import Fetch from '@kne/react-fetch';
import { useIntl } from '@kne/react-intl';
import withLocale from '@common/withLocale';
import DefaultAppIcon from '@common/DefaultAppIcon';
import style from './style.module.scss';

const { Text } = Typography;

const AppIcon = ({ item, Image }) => {
  if (item.icon && Image?.Avatar) {
    return <Image.Avatar id={item.icon} alt={item.label || item.name} size={40} shape="square" />;
  }
  return <DefaultAppIcon />;
};

/** 默认支持的语言：未传 languages 时编辑多语言名称提供中文与英文 */
const DEFAULT_LANGUAGES = ['zh-CN', 'en-US'];

const languageName = (code, locale) => {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code) || code;
  } catch (e) {
    return code;
  }
};

/** 按租户支持的语言逐个填写应用名称，留空的语言显示应用默认名称 */
const LabelsModal = ({ item, languages, saving, onCancel, onOk }) => {
  const { formatMessage, locale } = useIntl();
  const [values, setValues] = useState(() => Object.fromEntries(languages.map(code => [code, item.labelI18n?.[code] || ''])));
  const defaultLabel = item.label || item.name;
  return (
    <Modal
      open
      title={formatMessage({ id: 'appDisplay.labels.title' }, { name: defaultLabel })}
      okText={formatMessage({ id: 'common.save' })}
      cancelText={formatMessage({ id: 'common.cancel' })}
      confirmLoading={saving}
      onCancel={onCancel}
      onOk={() => onOk(values)}
    >
      <Text type="secondary" className={style['labels-tip']}>
        {formatMessage({ id: 'appDisplay.labels.tip' }, { name: defaultLabel })}
      </Text>
      <div className={classnames(style['labels-form'], 'app-display-settings-labels')}>
        {languages.map(code => (
          <label key={code} className={style['labels-field']}>
            <span className={style['labels-lang']}>
              {languageName(code, locale)} <Text type="secondary">{code}</Text>
            </span>
            <Input
              value={values[code]}
              maxLength={100}
              placeholder={item.defaultLabelI18n?.[code] || defaultLabel}
              onChange={e => setValues(current => Object.assign({}, current, { [code]: e.target.value }))}
            />
          </label>
        ))}
      </div>
    </Modal>
  );
};

const Row = ({ item, Image, languages, saving, onChange, onEditLabels }) => {
  const { formatMessage } = useIntl();
  const options = [
    { label: formatMessage({ id: 'appDisplay.mode.center' }), value: 'center' },
    { label: formatMessage({ id: 'appDisplay.mode.menu' }), value: 'menu', disabled: !item.supportsMenu }
  ];
  const segmented = (
    <Segmented
      className="app-display-settings-mode"
      value={item.displayMode}
      options={options}
      disabled={saving}
      onChange={value => onChange(item, value)}
    />
  );
  return (
    <div className={classnames(style['row'], 'app-display-settings-row')}>
      <div className={classnames(style['icon'], 'app-display-settings-icon')}>
        <AppIcon item={item} Image={Image} />
      </div>
      <div className={style['info']}>
        <div className={style['title']}>
          <span className={classnames(style['label'], 'app-display-settings-label')}>{item.label || item.name}</span>
          {!item.configured && item.supportsMenu && <Tag bordered={false}>{formatMessage({ id: 'appDisplay.default' })}</Tag>}
        </div>
        <Text type="secondary" className={style['desc']}>
          {item.supportsMenu ? formatMessage({ id: 'appDisplay.menuCount' }, { value: item.menuCount }) : formatMessage({ id: 'appDisplay.noMenu' })}
        </Text>
        {languages.length > 0 && (
          <div className={style['labels-entry']}>
            <Button
              type="link"
              size="small"
              className={classnames(style['labels-button'], 'app-display-settings-labels-edit')}
              onClick={() => onEditLabels(item)}
            >
              {formatMessage({ id: 'appDisplay.labels.edit' })}
            </Button>
            <Text type="secondary" className={style['desc']}>
              {formatMessage(
                { id: 'appDisplay.labels.progress' },
                { done: languages.filter(code => item.labelI18n?.[code]).length, total: languages.length }
              )}
            </Text>
          </div>
        )}
        {item.menuStatus === 'error' && (
          <Text type="warning" className={style['desc']}>
            {formatMessage({ id: 'appDisplay.menuError' }, { error: item.menuError || '-' })}
          </Text>
        )}
      </div>
      {item.supportsMenu ? segmented : <Tooltip title={formatMessage({ id: 'appDisplay.noMenu' })}>{segmented}</Tooltip>}
    </div>
  );
};

const AppDisplaySettings = createWithRemoteLoader({
  modules: ['components-core:Global@usePreset', 'components-core:Image']
})(
  withLocale(({ remoteModules, className, tenantId, languages: languagesProp, onChange }) => {
    const [usePreset, Image] = remoteModules;
    const { ajax, apis } = usePreset();
    const { formatMessage } = useIntl();
    const { message } = App.useApp();
    const [savingName, setSavingName] = useState(null);
    const [editing, setEditing] = useState(null);
    const languages = useMemo(() => {
      const list = Array.isArray(languagesProp) ? languagesProp.filter(Boolean) : [];
      return [...new Set(list.length ? list : DEFAULT_LANGUAGES)];
    }, [languagesProp]);

    // 设置按租户保存：由超级管理员的租户详情页传入 tenantId；未传入时不展示（普通租户不能在此配置）
    if (!tenantId) {
      return null;
    }

    const renderList = ({ data, loading, reload }) => {
      if (loading) {
        return (
          <div className={style['loading']}>
            <Spin />
          </div>
        );
      }
      const list = data?.pageData || [];
      if (!list.length) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={formatMessage({ id: 'appDisplay.empty' })} />;
      }
      const handleChange = async (item, displayMode) => {
        if (displayMode === item.displayMode) {
          return;
        }
        setSavingName(item.name);
        try {
          const { data: resData } = await ajax(
            Object.assign({}, apis.appManager.centerDisplaySettingsSave, { data: { tenantId, name: item.name, displayMode } })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'appDisplay.saveSuccess' }, { name: item.label || item.name }));
          await reload();
          onChange?.({ name: item.name, displayMode });
        } finally {
          setSavingName(null);
        }
      };
      const handleSaveLabels = async labelI18n => {
        setSavingName(editing.name);
        try {
          const { data: resData } = await ajax(
            Object.assign({}, apis.appManager.centerDisplaySettingsSave, { data: { tenantId, name: editing.name, labelI18n } })
          );
          if (resData.code !== 0) {
            return;
          }
          message.success(formatMessage({ id: 'appDisplay.labels.saveSuccess' }, { name: editing.label || editing.name }));
          const saved = { name: editing.name, labelI18n: resData.data?.labelI18n || {} };
          setEditing(null);
          await reload();
          onChange?.(saved);
        } finally {
          setSavingName(null);
        }
      };
      return (
        <>
          {list.map(item => (
            <Row
              key={item.name}
              item={item}
              Image={Image}
              languages={languages}
              saving={savingName === item.name}
              onChange={handleChange}
              onEditLabels={setEditing}
            />
          ))}
          {editing && (
            <LabelsModal
              key={editing.name}
              item={editing}
              languages={languages}
              saving={savingName === editing.name}
              onCancel={() => setEditing(null)}
              onOk={handleSaveLabels}
            />
          )}
        </>
      );
    };

    return (
      <section className={classnames(style['root'], 'app-display-settings', className)}>
        <Fetch {...Object.assign({}, apis.appManager.centerDisplaySettings, { params: { tenantId } })} key={tenantId} render={renderList} />
      </section>
    );
  })
);

export default AppDisplaySettings;
