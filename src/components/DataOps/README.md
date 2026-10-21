# DataOps

### 概述

应用详情的「数据运维」内容：直接查看和维护应用自己的数据表。 可单独使用，也是 `Detail` / `Manager` 中对应 Tab 的内容。

- **数据浏览**：左侧表列表，右侧分页浏览行数据并支持筛选
- **行编辑**：按列类型生成表单，增删改行数据并可恢复
- **只读 SQL**：执行查询语句查看结果
- **数据库连接**：切换默认托管库或自定义连接


### 示例(全屏)

#### 示例代码

- 数据运维
- 浏览应用数据表、编辑与恢复行数据、执行只读 SQL，并可切换应用数据库连接
- _AppDataOps(@components/DataOps),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: DataOps } = _AppDataOps;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <DataOps data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### DataOps

数据运维。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| data | object | 是 | - | 应用详情（`apis.appManager.detail` 的返回值） |
| onSuccess | () => void | 否 | - | 数据变更成功后的回调，通常用于刷新应用详情 |

接口配置通过 `components-core:Global@usePreset` 读取 `apis.appManager`，使用 `components-app-manager:Apis@getApis` 生成。
