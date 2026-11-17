/** 解析详情「主页」iframe 地址：homePath 相对应用根，或完整 http(s) */
const resolveHomeUrl = app => {
  const homePath = app?.homePath || app?.options?.homePath || '/';
  if (/^https?:\/\//i.test(homePath)) {
    return homePath;
  }
  const linked = app?.kind === 'linked' || app?.options?.kind === 'linked';
  const baseRaw = linked ? app?.options?.baseUrl || app?.pathUrl || '' : app?.pathUrl || app?.openUrl || `/app/${encodeURIComponent(app?.name || '')}/`;
  const base = String(baseRaw).replace(/\/+$/, '');
  const path = homePath === '/' ? '/' : homePath.startsWith('/') ? homePath : `/${homePath}`;
  if (!base) {
    return path;
  }
  if (path === '/') {
    return `${base}/`;
  }
  return `${base}${path}`;
};

export default resolveHomeUrl;
