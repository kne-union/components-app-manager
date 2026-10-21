# Center

### 概述

面向普通用户的应用中心面板，展示宿主上所有运行中的应用，点开即用。只包含分类标签与应用网格，页面标题、导航等由宿主布局提供。

- **分类浏览**：按应用分类切换标签，分类名称与排序来自宿主的分组接口
- **多入口应用**：一个应用配置了多个入口（如候选人端、管理端）时，点击后弹窗选择
- **登录态区分**：已登录用户看到全部运行中应用，未登录只看到公开应用
- **PWA 友好**：同步应用列表到 `@kne/pwa-document`，安装为独立窗口后同源应用在当前窗口内打开


### 示例(全屏)

#### 示例代码

- 应用中心
- 用户侧应用中心：按分类浏览运行中的应用，多入口应用点击后弹窗选择入口；已登录用户看到全部运行中应用，未登录只看到公开应用
- _AppCenter(@components/Center),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: Center } = _AppCenter;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Center />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Center

用户侧应用中心面板（分类标签 + 应用网格），不含页面标题与搜索，直接嵌入宿主页面。

##### 属性说明

| 属性名    | 类型   | 必填 | 默认值 | 说明                   |
| --------- | ------ | ---- | ------ | ---------------------- |
| className | string | 否   | -      | 追加到面板根节点的类名 |

##### 依赖的 preset 字段

| 字段                             | 类型                 | 必填 | 说明                                                                                                                                             |
| -------------------------------- | -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| apis.appManager.centerList       | object               | 是   | 登录用户可见的应用列表接口                                                                                                                       |
| apis.appManager.centerPublicList | object               | 是   | 未登录时的公开应用列表接口                                                                                                                       |
| apis.appManager.group.groupList  | object               | 否   | 应用分类接口（`@kne/fastify-app-manager` 内置的分组接口，`type=app`），使用 `Apis@getApis` 生成时自带；不提供时分类标签显示应用自带的 `category` |
| getUserAccessToken               | () => string \| null | 否   | 用于判断是否已登录，未提供时视为未登录                                                                                                           |
