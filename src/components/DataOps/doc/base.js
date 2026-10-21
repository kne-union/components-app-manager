const { default: DataOps } = _AppDataOps;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <DataOps data={mockApp} onSuccess={() => {}} />
    </PureGlobal>
  );
});

render(<BaseExample />);
