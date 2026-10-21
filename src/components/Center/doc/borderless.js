const { default: Center } = _AppCenter;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;

const BorderlessExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal']
})(({ remoteModules }) => {
  const [PureGlobal] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <div style={{ padding: 24, background: 'linear-gradient(180deg, #f5f0ff, #eef4ff)' }}>
        <Center bordered={false} />
      </div>
    </PureGlobal>
  );
});

render(<BorderlessExample />);
