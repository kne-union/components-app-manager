### AppDisplaySettings

租户设置里的应用展示方式面板（应用列表 + 展示位置单选）。

#### 属性说明

| 属性名    | 类型                            | 必填 | 默认值 | 说明                                         |
| --------- | ------------------------------- | ---- | ------ | -------------------------------------------- |
| tenantId  | string                          | 是   | -      | 要配置的租户 ID（超级管理员租户详情页传入）  |
| languages | string[]                        | 否   | ['zh-CN', 'en-US'] | 编辑多语言名称时可填写的语言码（通常传租户的 supportLanguage），未传或为空时默认中文与英文 |
| className | string                          | 否   | -      | 追加到根节点的类名                           |
| onChange  | ({ name, labelI18n? , displayMode? }) => void | 否 | - | 某个应用保存成功后触发（展示方式或多语言名称），宿主可借此刷新左菜单 |

#### 可定制的固定类名

| 类名                       | 元素             |
| -------------------------- | ---------------- |
| app-display-settings       | 根节点           |
| app-display-settings-row   | 单个应用行       |
| app-display-settings-icon  | 应用图标容器     |
| app-display-settings-label | 应用名称         |
| app-display-settings-mode  | 展示方式单选控件 |

#### 依赖的 preset 字段

| 字段                                      | 类型   | 必填 | 说明                                                  |
| ----------------------------------------- | ------ | ---- | ----------------------------------------------------- |
| ajax                                      | func   | 是   | 保存时发起请求                                        |
| apis.appManager.centerDisplaySettings     | object | 是   | 读取当前租户的应用展示方式，`Apis@getApis` 生成时自带 |
| apis.appManager.centerDisplaySettingsSave | object | 是   | 保存某个应用的展示方式，`Apis@getApis` 生成时自带     |

#### 多语言名称

每个应用可点「多语言名称」按语言设置租户级名称，保存到 `apis.appManager.centerDisplaySettingsSave` 的 `labelI18n`（整体替换，留空的语言被移除）。输入框占位文案为不含租户配置的默认名称（应用中心配置覆盖子应用声明，没有则为应用 `label`）。语言范围由 `languages` 决定，宿主通常传租户的 `supportLanguage`，未传时默认中文与英文。

后端 `@kne/fastify-app-manager` 需配置 `getTenantId`、`canManageDisplay`，可选 `defaultDisplayMode`（`center` / `menu`，默认 `center`）。
