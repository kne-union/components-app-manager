### Detail

应用详情页。

#### 属性说明

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 否 | - | 应用标识；不传时读取地址栏 `?name=` |
| baseUrl | string | 否 | - | 返回列表与删除应用后跳转的地址 |

其余属性透传给 `components-core:Layout@StateBarPage`。
