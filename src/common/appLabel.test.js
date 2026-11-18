import getAppLabel from './appLabel';

describe('getAppLabel', () => {
  const app = { name: 'orders', label: '订单系统', labelI18n: { 'zh-CN': '订单', 'en-US': 'Orders' } };

  it('优先取当前语言的多语言名称', () => {
    expect(getAppLabel(app, 'en-US')).toBe('Orders');
    expect(getAppLabel(app, 'zh-CN')).toBe('订单');
  });

  it('当前语言没有名称时回退到 label，再回退到 name', () => {
    expect(getAppLabel(app, 'ja-JP')).toBe('订单系统');
    expect(getAppLabel(app, undefined)).toBe('订单系统');
    expect(getAppLabel({ name: 'orders' }, 'en-US')).toBe('orders');
  });

  it('没有 labelI18n 时使用 label', () => {
    expect(getAppLabel({ name: 'plain', label: '无菜单' }, 'en-US')).toBe('无菜单');
  });
});
