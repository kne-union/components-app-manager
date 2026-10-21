### getApis

生成 `apis.appManager` 接口配置。

#### 参数说明

| 参数           | 类型   | 必填 | 默认值                | 说明                                              |
| -------------- | ------ | ---- | --------------------- | ------------------------------------------------- |
| options.prefix | string | 否   | `/api/v1/app-manager` | 后端 `@kne/fastify-app-manager` 注册时的 `prefix` |

#### 返回值

| 类型   | 说明                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| object | 以接口名为 key（如 `list`、`detail`、`deploy`、`logsStream`、`centerList`、`openApi`）的 `{ url, method, paramsType }` 配置 |
