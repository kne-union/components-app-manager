# Manager

### 概述

应用中心的管理后台页面，配合 `@kne/fastify-app-manager` 使用。管理员可以在一个页面内完成应用从创建到上线运维的全部操作。由 `List`（列表）与 `Detail`（详情）组合而成，详情内的七个 Tab 也都是独立组件，宿主可以按需单独引用。

- **完整生命周期**：新建应用、上传 zip 版本、部署（可选执行 SQL 迁移）、启动 / 停止 / 重启、删除
- **实时可观测**：部署进度、运行日志与负载曲线均通过 SSE 实时推送，支持日志归档下载
- **环境变量按 schema 编辑**：读取版本内 `env.schema.json`，区分必填、默认值与密钥，校验未通过时直接提示
- **数据运维**：浏览应用数据表、编辑与恢复行数据、执行只读 SQL
- **接口文档**：读取运行中应用的 `open-api.json` 在线调试，调用记录与用例按应用保存、管理员共享；需要宿主为插件配置 `getOpenApiToken` / `issueUserAccessToken`
- **进程设置**：按应用调整 PM2 运行模式、实例数、内存上限等，留空项使用应用中心默认值
- **宿主无关**：接口前缀、静态资源地址与访问令牌都由宿主 preset 注入，可挂到任意后台路由下


### 示例(全屏)

#### 示例代码

- 应用管理后台
- 管理员视角的应用管理：列表筛选、新建/编辑应用、上传版本、部署（含 SQL 迁移）、启停、环境变量、日志与数据运维；详情页通过 ?name= 打开
- _AppManager(@components/Manager),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { default: Manager } = _AppManager;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes, Navigate } = reactRouterDom;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="/Manager/app-manager/*" element={<Manager baseUrl="/Manager" />} />
          <Route path="*" element={<Navigate to="/Manager/app-manager" replace />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Manager

应用管理页面（默认导出，等同 `AppListPage`）。内部注册 `index`（列表）与 `detail`（详情，`?name=` 指定应用）两个子路由，需挂在 `{baseUrl}/app-manager/*` 路由下。

##### 属性说明

| 属性名  | 类型   | 必填 | 默认值 | 说明                                                  |
| ------- | ------ | ---- | ------ | ----------------------------------------------------- |
| baseUrl | string | 是   | -      | 父级路由前缀，页面实际路径为 `${baseUrl}/app-manager` |

##### 依赖的 preset 字段

通过 `components-core:Global@usePreset` 读取：

| 字段               | 类型                 | 必填 | 说明                                                                        |
| ------------------ | -------------------- | ---- | --------------------------------------------------------------------------- |
| ajax               | function             | 是   | 请求方法，返回 `{ data: { code, data } }`                                   |
| apis.appManager    | object               | 是   | 接口配置，使用 `components-app-manager:Apis@getApis` 生成                   |
| staticUrl          | string               | 否   | SSE / 下载链接的域名，不传时使用当前站点                                    |
| getUserAccessToken | () => string \| null | 否   | 返回当前用户访问令牌；SSE 与下载链接无法带请求头，会以 `?token=` 拼到地址上 |

##### 其他导出

| 名称        | 说明                                     |
| ----------- | ---------------------------------------- |
| AppListPage | 与默认导出相同                           |
| getApis     | 同 `components-app-manager:Apis@getApis` |
