const { default: AppEmbed } = _AppEmbed;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const MissingExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AppEmbed appName="ghost-app" menuKey="home" baseUrl="/tenant/ext/ghost-app/home" />
    </PureGlobal>
  );
});

render(<MissingExample />);
