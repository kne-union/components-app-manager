import { createWithRemoteLoader } from '@kne/remote-loader';
import { App, Button } from 'antd';
import { useIntl } from '@kne/react-intl';
import withLocale from '@common/withLocale';

const LinkImport = createWithRemoteLoader({
  modules: ['components-core:FormInfo@useFormModal', 'components-core:FormInfo', 'components-core:Global@usePreset']
})(
  withLocale(({ remoteModules, onSuccess, className }) => {
    const [useFormModal, FormInfo, usePreset] = remoteModules;
    const formModal = useFormModal();
    const { ajax, apis } = usePreset();
    const { message } = App.useApp();
    const { formatMessage } = useIntl();
    const { Input, TextArea, Avatar } = FormInfo.fields;

    return (
      <Button
        type="default"
        className={className}
        onClick={() => {
          formModal({
            title: formatMessage({ id: 'appManager.link.importTitle' }),
            size: 'small',
            formProps: {
              onSubmit: async formData => {
                const { data: resData } = await ajax(
                  Object.assign({}, apis.appManager.linkImport, {
                    data: {
                      installKey: String(formData.installKey || '').trim(),
                      name: formData.name || undefined,
                      label: formData.label || undefined,
                      icon: formData.icon || undefined
                    }
                  })
                );
                if (resData.code !== 0) {
                  return false;
                }
                message.success(formatMessage({ id: 'appManager.link.importSuccess' }));
                onSuccess && onSuccess(resData.data);
              }
            },
            children: (
              <FormInfo
                column={1}
                list={[
                  <TextArea name="installKey" label={formatMessage({ id: 'appManager.link.installKey' })} rule="REQ" autoSize={{ minRows: 4, maxRows: 10 }} />,
                  <Input name="name" label={formatMessage({ id: 'appManager.link.nameOptional' })} />,
                  <Input name="label" label={formatMessage({ id: 'appManager.link.labelOptional' })} />,
                  <Avatar name="icon" label={formatMessage({ id: 'appManager.link.iconOptional' })} block shape="square" interceptor="photo-string" />
                ]}
              />
            )
          });
        }}
      >
        {formatMessage({ id: 'appManager.list.linkImport' })}
      </Button>
    );
  })
);

export default LinkImport;
