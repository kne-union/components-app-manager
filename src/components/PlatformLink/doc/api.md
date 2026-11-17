### PlatformLink

外部应用 break-glass：登记主平台、生成 installKey、解绑与访问记录。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| prefix | string | 否 | `/app-ops` | app-ops 接口前缀；列表、登记、解绑、访问记录均相对此前缀请求 |

#### 依赖接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `{prefix}/link/platforms` | 平台列表 |
| POST | `{prefix}/link/register` | 登记 / 重新生成 Key，返回一次性 `installKey` |
| POST | `{prefix}/link/unlink` | 解绑平台 |
| GET | `{prefix}/link/access-logs` | 访问记录，支持 `platformOrigin` / `limit` / `offset` |

需本机管理员身份，且服务端开启 `APP_OPS_ENABLED`。
