### Manager

应用管理页面（默认导出，等同 `AppListPage`）。内部注册 `index`（列表）与 `detail`（详情，`?name=` 指定应用）两个子路由，需挂在 `{baseUrl}/app-manager/*` 路由下。

#### 属性说明

| 属性名  | 类型   | 必填 | 默认值 | 说明                                                  |
| ------- | ------ | ---- | ------ | ----------------------------------------------------- |
| baseUrl | string | 是   | -      | 父级路由前缀，页面实际路径为 `${baseUrl}/app-manager` |

#### 依赖的 preset 字段

通过 `components-core:Global@usePreset` 读取：

| 字段               | 类型                 | 必填 | 说明                                                                        |
| ------------------ | -------------------- | ---- | --------------------------------------------------------------------------- |
| ajax               | function             | 是   | 请求方法，返回 `{ data: { code, data } }`                                   |
| apis.appManager    | object               | 是   | 接口配置，使用 `components-app-manager:Apis@getApis` 生成                   |
| staticUrl          | string               | 否   | SSE / 下载链接的域名，不传时使用当前站点                                    |
| getUserAccessToken | () => string \| null | 否   | 返回当前用户访问令牌；SSE 与下载链接无法带请求头，会以 `?token=` 拼到地址上 |

#### 其他导出

| 名称        | 说明                                     |
| ----------- | ---------------------------------------- |
| AppListPage | 与默认导出相同                           |
| getApis     | 同 `components-app-manager:Apis@getApis` |
