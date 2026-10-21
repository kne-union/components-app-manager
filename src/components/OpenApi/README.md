# OpenApi

### 概述

应用详情的「接口文档」内容：读取运行中应用的 `open-api.json`，提供接口浏览与在线调试。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **在线调试**：以宿主签发的令牌经网关调用子应用接口，令牌到期前自动续签
- **调用记录与用例**：存到服务端、管理员共享，支持分页加载与搜索
- **状态感知**：应用未运行或部署 / 恢复中时只提示状态，不发请求
- 宿主需要为 `@kne/fastify-app-manager` 配置 `getOpenApiToken` / `issueUserAccessToken`


### 示例(全屏)

#### 示例代码

- 接口文档
- 读取运行中应用的 open-api.json，按分组浏览接口并在线调试；调用记录与用例按应用保存
- _AppOpenApi(@components/OpenApi),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: OpenApi } = _AppOpenApi;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <OpenApi data={mockApp} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### OpenApi

接口文档。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
