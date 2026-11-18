### AppEmbed

嵌入某个应用的某个菜单页面。

#### 属性说明

| 属性名     | 类型   | 必填 | 默认值 | 说明                                                                                           |
| ---------- | ------ | ---- | ------ | ---------------------------------------------------------------------------------------------- |
| appName    | string | 是\* | -      | 应用 slug；未传 `app` 与 `menu` 时据此从 `centerMenus` 查找                                    |
| menuKey    | string | 是\* | -      | 菜单的 `fullKey`（如 `report/sales`，顶层菜单即 `key`）                                        |
| app        | object | 否   | -      | `centerMenus` 返回的应用项；与 `menu` 同时传入时不再请求 `centerMenus`，宿主已有菜单数据时使用 |
| menu       | object | 否   | -      | 菜单节点（叶子）                                                                               |
| baseUrl    | string | 否   | -      | 该菜单在宿主中的路由前缀，原样传给子应用页面组件，用于内部子路由与跳转                         |
| tenantId   | string | 否   | -      | 当前租户，传给子应用（切换租户时宿主应以它为 key 重新挂载）                                    |
| themeToken | object | 否   | -      | 宿主主题，传给子应用的 `ComponentPreset`                                                       |
| className  | string | 否   | -      | 追加到内容根节点的类名                                                                         |

\* 传了 `app` 与 `menu` 时可省略 `appName` / `menuKey`。

#### 集成方式

| integration | 表现                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| remote      | 加载 `{remote.name}:{remote.preset}` 作为外层，`{remote.name}:{menu.component}` 作为页面组件 |
| iframe      | 嵌入 `{baseUrl}{menu.path}?embed=1`；linked 应用加 `sandbox`                                 |
| blank       | 显示「在新窗口打开」按钮，打开 `{baseUrl}{menu.path}`                                        |

#### 传给子应用的属性（remote）

外层 `ComponentPreset`：`ajax`（宿主的请求方法，带宿主登录令牌）、`apiHost`（`/app/{name}`，同源经应用中心网关转发，网关把宿主令牌换成子应用令牌）、`themeToken`、`tenantId`。子应用接口地址用 `${apiHost}/api/...` 拼接并用传入的 `ajax` 发起，不要自行申请令牌或直连子应用域名。页面组件：`appName`、`baseUrl`、`tenantId`、`menu`，以及菜单声明的 `props`。

#### 依赖的 preset 字段

| 字段                        | 类型   | 必填 | 说明                                                      |
| --------------------------- | ------ | ---- | --------------------------------------------------------- |
| ajax                        | func   | 是   | 请求菜单，并原样传给子应用                                |
| apis.appManager.centerMenus | object | 是   | 当前租户左菜单展示的应用及菜单，`Apis@getApis` 生成时自带 |
| apis.appManager.centerStatus | object | 是   | 应用状态检测（`GET .../app/center/status`），`Apis@getApis` 生成时自带；返回 `{ status, healthy, message }` |

#### 应用状态检测

渲染菜单页面的同时，组件异步请求一次 `centerStatus`（只在应用切换时请求，不轮询）：

- `healthy` 为 true：什么都不做，页面保持原样
- `healthy` 为 false：页面切换为错误状态，显示应用状态与原因，并提供「重新检测」；重新检测恢复后回到页面
- 检测请求本身失败（网络、鉴权）：视为无法判断，不打断页面

应用挂了时，应用中心 `centerMenus` 仍会返回它上一次缓存的菜单（带 `status: 'error'`），所以入口不会消失，是否可用以进入页面后的状态检测为准。

#### 其它导出

`findMenu(menus, menuKey)`：在菜单树中按 `fullKey` 查找节点。
