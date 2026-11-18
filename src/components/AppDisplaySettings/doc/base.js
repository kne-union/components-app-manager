const { default: AppDisplaySettings } = _AppDisplaySettings;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <AppDisplaySettings tenantId="demo-tenant" />
    </PureGlobal>
  );
});

render(<BaseExample />);
