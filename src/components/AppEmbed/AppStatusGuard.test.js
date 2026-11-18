/* 这里直接用 react-dom 的 act / root.render，没有使用 Testing Library；该规则会把 root.render 误判成 Testing Library 的 render */
/* eslint-disable testing-library/no-unnecessary-act */
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import AppStatusGuard from './AppStatusGuard';

jest.mock('@kne/react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }, values) => `${id}${values ? JSON.stringify(values) : ''}`, locale: 'zh-CN' })
}));

// 这个 jest 环境里加载不了 antd / @ant-design/icons 的 ESM 入口，换成最小替身
jest.mock('antd', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>
}));

jest.mock('@ant-design/icons', () => ({
  DisconnectOutlined: () => <span />
}));

const app = { name: 'orders', label: '订单' };
const apis = { appManager: { centerStatus: { url: '/api/v1/app-manager/app/center/status', method: 'GET', paramsType: 'params' } } };

describe('AppStatusGuard', () => {
  let container;
  let root;

  const flush = () => act(async () => {});

  const render = async ajax => {
    await act(async () => {
      root.render(
        <AppStatusGuard app={app} ajax={ajax} apis={apis}>
          <div id="page">页面</div>
        </AppStatusGuard>
      );
    });
    await flush();
  };

  beforeEach(() => {
    window.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('应用正常：页面照常显示，什么都不做，只检测一次', async () => {
    const ajax = jest.fn().mockResolvedValue({ data: { code: 0, data: { name: 'orders', status: 'running', healthy: true, message: null } } });
    await render(ajax);
    expect(container.querySelector('#page')).not.toBeNull();
    expect(container.querySelector('.app-embed-unavailable')).toBeNull();
    expect(ajax).toHaveBeenCalledTimes(1);
    expect(ajax).toHaveBeenCalledWith(expect.objectContaining({ url: apis.appManager.centerStatus.url, params: { name: 'orders' } }));
  });

  it('检测期间页面已经显示，不被检测阻塞', async () => {
    const ajax = jest.fn().mockReturnValue(new Promise(() => {}));
    await act(async () => {
      root.render(
        <AppStatusGuard app={app} ajax={ajax} apis={apis}>
          <div id="page">页面</div>
        </AppStatusGuard>
      );
    });
    expect(container.querySelector('#page')).not.toBeNull();
  });

  it('应用不可用：切换到错误状态，且不向用户暴露状态码与后端原因', async () => {
    const ajax = jest
      .fn()
      .mockResolvedValue({ data: { code: 0, data: { name: 'orders', status: 'error', healthy: false, message: 'pm2 process errored' } } });
    await render(ajax);
    expect(container.querySelector('#page')).toBeNull();
    const error = container.querySelector('.app-embed-unavailable');
    expect(error).not.toBeNull();
    expect(error.textContent).toContain('appEmbed.unavailable');
    expect(error.textContent).not.toContain('pm2 process errored');
    expect(error.textContent).not.toContain('error');
    expect(error.textContent).not.toContain('status');
  });

  it('检测请求本身失败或返回业务错误：不打断页面', async () => {
    await render(jest.fn().mockRejectedValue(new Error('network')));
    expect(container.querySelector('#page')).not.toBeNull();
    await act(async () => root.unmount());
    root = createRoot(container);
    await render(jest.fn().mockResolvedValue({ data: { code: 401, msg: 'unauthorized' } }));
    expect(container.querySelector('#page')).not.toBeNull();
  });

  it('重新检测：恢复后回到页面，仍异常则停留在错误状态', async () => {
    const down = { data: { code: 0, data: { name: 'orders', status: 'error', healthy: false, message: 'down' } } };
    const up = { data: { code: 0, data: { name: 'orders', status: 'running', healthy: true, message: null } } };
    const ajax = jest.fn().mockResolvedValueOnce(down).mockResolvedValueOnce(down).mockResolvedValueOnce(up);
    await render(ajax);
    const recheck = () => container.querySelector('.app-embed-unavailable button');
    await act(async () => recheck().click());
    await flush();
    expect(container.querySelector('.app-embed-unavailable')).not.toBeNull();
    await act(async () => recheck().click());
    await flush();
    expect(container.querySelector('#page')).not.toBeNull();
    expect(ajax).toHaveBeenCalledTimes(3);
  });
});
