const { default: AppEmbed } = _AppEmbed;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AppEmbed appName="hr-portal" menuKey="jobs" baseUrl="/tenant/ext/hr-portal/jobs" />
    </PureGlobal>
  );
});

render(<BaseExample />);
