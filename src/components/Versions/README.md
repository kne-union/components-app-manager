# Versions

### 概述

应用详情的「版本」内容：列出应用的全部版本，可上传新版本、部署指定版本并管理 SQL 迁移。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **上传版本**：上传 zip 包生成新版本，服务端自动安装依赖
- **部署**：选择版本部署，可逐个决定待执行的 SQL 迁移
- **部署记录**：查看历史部署进度与结果


### 示例(全屏)

#### 示例代码

- 版本管理
- 版本列表：上传 zip 版本、部署（可选执行 SQL 迁移）、查看部署记录、下载版本包
- _AppVersions(@components/Versions),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Versions } = _AppVersions;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Versions data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Versions

版本管理。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |
| onSuccess | () => void | 否 | - | 数据变更成功后的回调，通常用于刷新应用详情 |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
