const { default: AppEmbed } = _AppEmbed;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

// 模拟应用已挂：状态检测返回不可用，页面先照常渲染，检测完成后切换到错误状态
const downPreset = {
  ...mockPreset,
  apis: {
    ...mockPreset.apis,
    appManager: {
      ...mockPreset.apis.appManager,
      centerStatus: {
        ...mockPreset.apis.appManager.centerStatus,
        loader: () => new Promise(resolve => setTimeout(() => resolve({ name: 'hr-portal', status: 'error', healthy: false, message: 'pm2 process errored' }), 1000))
      }
    }
  }
};

const DownExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={downPreset}>
      <AppEmbed appName="hr-portal" menuKey="jobs" baseUrl="/tenant/ext/hr-portal/jobs" />
    </PureGlobal>
  );
});

render(<DownExample />);
