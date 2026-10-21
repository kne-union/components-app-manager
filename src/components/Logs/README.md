# Logs

### 概述

应用详情的「日志」内容：通过 SSE 实时查看应用进程输出。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **实时推送**：开启 / 停止实时推送，标准输出与错误输出分开查看，向上滚动加载更早的日志
- **过滤**：按关键字或正则过滤
- **归档**：查看历史日志文件并下载


### 示例(全屏)

#### 示例代码

- 运行日志
- 实时运行日志：SSE 推送、按输出流切换、关键字 / 正则过滤、加载历史，以及日志归档下载
- _AppLogs(@components/Logs),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Logs } = _AppLogs;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Logs data={mockApp} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Logs

运行日志。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
