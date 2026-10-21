应用详情的「接口文档」内容：读取运行中应用的 `open-api.json`，提供接口浏览与在线调试。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **在线调试**：以宿主签发的令牌经网关调用子应用接口，令牌到期前自动续签
- **调用记录与用例**：存到服务端、管理员共享，支持分页加载与搜索
- **状态感知**：应用未运行或部署 / 恢复中时只提示状态，不发请求
- 宿主需要为 `@kne/fastify-app-manager` 配置 `getOpenApiToken` / `issueUserAccessToken`
