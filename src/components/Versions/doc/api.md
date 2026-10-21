### Versions

版本管理。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |
| onSuccess | () => void | 否 | - | 数据变更成功后的回调，通常用于刷新应用详情 |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
