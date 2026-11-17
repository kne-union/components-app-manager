# PlatformLink

### 概述

外部应用本地管理员的「平台关联」页：登记主平台、生成一次性 installKey、解绑，并查看访问记录。需开启 `APP_OPS_ENABLED`，接口走本机 `/app-ops/link/*`。

- **登记与密钥**：填写主平台地址后生成 installKey，弹窗内仅展示一次，供主平台「关联外部应用」导入
- **连接状态**：展示已配对 / 已出 Key / 待激活 / 异常等状态，未配对可重新生成 Key
- **访问记录**：默认查看全部平台，可按平台筛选；连续相同动作会折叠为「×N」


### 示例(全屏)

#### 示例代码

- 平台关联
- 外部应用本地管理员登记主平台、生成一次性 installKey、查看配对状态与访问记录（连续同类记录会折叠）
- _PlatformLink(@components/PlatformLink),_mockPreset(@root/mockPreset),remoteLoader(@kne/remote-loader)

```jsx
const { default: PlatformLink } = _PlatformLink;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <PlatformLink />
    </PureGlobal>
  );
});

render(<BaseExample />);

```

### API

#### PlatformLink

外部应用 break-glass：登记主平台、生成 installKey、解绑与访问记录。

##### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| prefix | string | 否 | `/app-ops` | app-ops 接口前缀；列表、登记、解绑、访问记录均相对此前缀请求 |

##### 依赖接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `{prefix}/link/platforms` | 平台列表 |
| POST | `{prefix}/link/register` | 登记 / 重新生成 Key，返回一次性 `installKey` |
| POST | `{prefix}/link/unlink` | 解绑平台 |
| GET | `{prefix}/link/access-logs` | 访问记录，支持 `platformOrigin` / `limit` / `offset` |

需本机管理员身份，且服务端开启 `APP_OPS_ENABLED`。
