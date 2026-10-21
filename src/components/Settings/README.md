# Settings

### 概述

应用详情的「设置」内容：按应用调整 PM2 进程参数。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **按需覆盖**：只保存与默认值不同的项，留空使用应用中心默认配置
- **集群模式**：切到 cluster 时才可设置实例数
- **格式校验**：内存上限、稳定时长按 PM2 格式校验；保存后重启应用生效


### 示例(全屏)

#### 示例代码

- 进程设置
- 按应用调整 PM2 运行模式、实例数、内存上限、自动重启等，留空项使用应用中心默认值
- _AppSettings(@components/Settings),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Settings } = _AppSettings;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Settings data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Settings

进程设置。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |
| onSuccess | () => void | 否 | - | 数据变更成功后的回调，通常用于刷新应用详情 |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
