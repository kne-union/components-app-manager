# List

### 概述

管理员视角的应用列表页，基于 `components-admin:BizUnit`。可单独使用，也是 `Manager` 的列表路由内容。

- **筛选与搜索**：按状态筛选、按名称关键字搜索
- **两种视图**：表格与应用市场风格卡片切换，移动端自动使用卡片
- **新建与行操作**：新建应用、编辑、上传版本、启停、删除
- **跳转详情**：点击应用以相对路径跳转 `detail?name=`，需要宿主在同级注册 `Detail` 路由


### 示例(全屏)

#### 示例代码

- 应用列表
- BizUnit 应用列表：状态筛选、关键字搜索、表格 / 卡片视图切换、新建应用与行操作；点击应用跳转 detail?name=
- _AppList(@components/List),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { default: List } = _AppList;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes } = reactRouterDom;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="*" element={<List baseUrl="/List" />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### List

应用列表页。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| baseUrl | string | 否 | - | 列表所在路由前缀 |
| menu | ReactNode | 否 | - | 透传给 BizUnit `page.menu` 的侧边菜单 |

其余属性透传给 `components-admin:BizUnit`。
