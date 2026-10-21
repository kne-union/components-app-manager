const { default: Env } = _AppEnv;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Env data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);
