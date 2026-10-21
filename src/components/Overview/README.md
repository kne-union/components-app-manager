# Overview

### 概述

应用详情的「概览」内容：顶部展示应用图标、名称、状态与端口等运行指标，下方是基于 SSE 的实时负载卡片和访问信息。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **运行指标**：状态、端口、当前版本与 PM2 进程名
- **实时负载**：进程（CPU、内存、实例数、重启次数、运行时长）与网关请求（QPS、并发、平均 / P95 / P99 耗时、错误率）通过 SSE 推送，带趋势曲线
- **访问入口**：访问路径直接打开应用，部署 / 恢复中自动拦截


### 示例(全屏)

#### 示例代码

- 应用概览
- 应用基本信息、运行指标、进程与请求实时负载，以及访问路径、域名、状态说明
- _AppOverview(@components/Overview),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Overview } = _AppOverview;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Overview data={mockApp} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Overview

应用概览。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
