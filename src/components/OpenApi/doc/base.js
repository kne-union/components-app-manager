const { default: OpenApi } = _AppOpenApi;
const { default: mockPreset, mockApp } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <OpenApi data={mockApp} />
    </PureGlobal>
  );
});

render(<BaseExample />);
