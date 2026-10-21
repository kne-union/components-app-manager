const { getApis } = _Apis;

const BaseExample = () => {
  const apis = getApis({ prefix: '/api/v1/app-manager' });
  return (
    <pre style={{ maxHeight: 400, overflow: 'auto' }}>
      {JSON.stringify({ appManager: { list: apis.list, detail: apis.detail, deploy: apis.deploy, centerList: apis.centerList } }, null, 2)}
    </pre>
  );
};

render(<BaseExample />);
