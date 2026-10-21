### Center

用户侧应用中心面板（分类标签 + 应用网格），不含页面标题与搜索，直接嵌入宿主页面。

#### 属性说明

| 属性名    | 类型    | 必填 | 默认值 | 说明                                                                    |
| --------- | ------- | ---- | ------ | ----------------------------------------------------------------------- |
| className | string  | 否   | -      | 追加到面板根节点的类名，配合下方固定类名定制内部样式                    |
| bordered  | boolean | 否   | true   | 为 `false` 时去掉面板边框、背景与阴影，分类标签与默认图标改用宿主主题色 |

#### 可定制的固定类名

内部元素在 CSS Modules 类名之外，额外带有固定的全局类名，宿主可通过 `className` 限定作用域后覆盖样式（CSS Modules 中写作 `.custom :global(.app-center-tab)`）。

| 类名                  | 元素                          |
| --------------------- | ----------------------------- |
| app-center            | 面板根节点                    |
| app-center-borderless | 根节点，`bordered={false}` 时 |
| app-center-header     | 顶部栏（分类标签 + 数量）     |
| app-center-tabs       | 分类标签容器                  |
| app-center-tab        | 单个分类标签                  |
| app-center-tab-active | 当前选中的分类标签            |
| app-center-count      | 应用数量文字                  |
| app-center-grid       | 应用网格                      |
| app-center-app        | 单个应用入口                  |
| app-center-icon       | 应用图标容器                  |
| app-center-label      | 应用名称                      |
| app-center-empty      | 空状态                        |

#### 依赖的 preset 字段

| 字段                             | 类型                 | 必填 | 说明                                                                                                                                             |
| -------------------------------- | -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| apis.appManager.centerList       | object               | 是   | 登录用户可见的应用列表接口                                                                                                                       |
| apis.appManager.centerPublicList | object               | 是   | 未登录时的公开应用列表接口                                                                                                                       |
| apis.appManager.group.groupList  | object               | 否   | 应用分类接口（`@kne/fastify-app-manager` 内置的分组接口，`type=app`），使用 `Apis@getApis` 生成时自带；不提供时分类标签显示应用自带的 `category` |
| getUserAccessToken               | () => string \| null | 否   | 用于判断是否已登录，未提供时视为未登录                                                                                                           |
