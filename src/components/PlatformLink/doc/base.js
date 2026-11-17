const { default: PlatformLink } = _PlatformLink;
const { default: createEntry } = remoteLoader;

const BaseExample = createEntry(({ children }) => children)(() => <PlatformLink />);

render(<BaseExample />);
