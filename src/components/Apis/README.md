# Apis

### 概述

生成应用中心前端所需的接口配置，与后端 `@kne/fastify-app-manager` 的路由一一对应。宿主只需传入插件注册时的前缀，即可得到可直接放进 `preset.apis.appManager` 的完整配置。


### 示例

#### 示例代码

- 生成接口配置
- 按后端 @kne/fastify-app-manager 的注册前缀生成 apis.appManager，放入宿主 preset
- _Apis(@components/Apis)

```jsx
const { getApis } = _Apis;

const BaseExample = () => {
  const apis = getApis({ prefix: '/api/v1/app-manager' });
  return (
    <pre style={{ maxHeight: 400, overflow: 'auto' }}>
      {JSON.stringify({ appManager: { list: apis.list, detail: apis.detail, deploy: apis.deploy, centerList: apis.centerList } }, null, 2)}
    </pre>
  );
};

render(<BaseExample />);

```

### API

#### getApis

生成 `apis.appManager` 接口配置。

##### 参数说明

| 参数           | 类型   | 必填 | 默认值                | 说明                                              |
| -------------- | ------ | ---- | --------------------- | ------------------------------------------------- |
| options.prefix | string | 否   | `/api/v1/app-manager` | 后端 `@kne/fastify-app-manager` 注册时的 `prefix` |

##### 返回值

| 类型   | 说明                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| object | 以接口名为 key（如 `list`、`detail`、`deploy`、`logsStream`、`centerList`、`openApi`）的 `{ url, method, paramsType }` 配置 |
