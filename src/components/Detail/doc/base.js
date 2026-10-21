const { default: Detail } = _AppDetail;
const { default: mockPreset } = _mockPreset;
const { createWithRemoteLoader } = remoteLoader;
const { Route, Routes } = reactRouterDom;

const BaseExample = createWithRemoteLoader({
  modules: ['components-core:Global@PureGlobal', 'components-core:Layout']
})(({ remoteModules }) => {
  const [PureGlobal, Layout] = remoteModules;
  return (
    <PureGlobal preset={mockPreset}>
      <Layout navigation={{ isFixed: false }}>
        <Routes>
          <Route path="*" element={<Detail baseUrl="/Detail" name="hr-portal" />} />
        </Routes>
      </Layout>
    </PureGlobal>
  );
});

render(<BaseExample />);
