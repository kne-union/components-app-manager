# Detail

### 概述

应用详情页，组合了七个独立的 Tab 组件。可单独使用，也是 `Manager` 的详情路由内容。

- **页头操作**：编辑、上传版本、删除
- **运行控制**：启动 / 停止 / 重启，部署或恢复中显示当前步骤并自动轮询
- **七个 Tab**：`Overview`、`Versions`、`OpenApi`、`Env`、`DataOps`、`Logs`、`Settings`，当前 Tab 记在 `?tab=`


### 示例(全屏)

#### 示例代码

- 应用详情
- 应用详情页：页头操作、运行控制条，以及概览 / 版本 / 接口文档 / 环境变量 / 数据运维 / 日志 / 设置七个 Tab
- _AppDetail(@components/Detail),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader),reactRouterDom(react-router-dom)

```jsx
const { default: Detail } = _AppDetail;
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
          <Route path="*" element={<Detail baseUrl="/Detail" name="hr-portal" />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### Detail

应用详情页。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 否 | - | 应用标识；不传时读取地址栏 `?name=` |
| baseUrl | string | 否 | - | 返回列表与删除应用后跳转的地址 |

其余属性透传给 `components-core:Layout@StateBarPage`。
