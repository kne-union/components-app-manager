# Env

### 概述

应用详情的「环境变量」内容：读取当前版本的 `env.schema.json`，按声明逐项编辑环境变量。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **按 schema 编辑**：展示类型、必填、默认值、枚举与说明
- **密钥保护**：密钥类变量脱敏展示，只能覆盖不能读取
- **校验提示**：缺失必填项或格式不符时，在对应行直接显示服务端校验信息
- **自定义变量**：可添加 schema 之外的变量并标记为密钥
- **批量导入**：支持粘贴或上传 `.env` 文本


### 示例(全屏)

#### 示例代码

- 环境变量
- 按版本内 env.schema.json 编辑环境变量，区分必填、默认值与密钥，校验失败直接提示
- _AppEnv(@components/Env),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Env } = _AppEnv;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Env data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Env

环境变量。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |
| onSuccess | () => void | 否 | - | 数据变更成功后的回调，通常用于刷新应用详情 |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
