// EventSource 与浏览器原生下载都无法携带请求头，token 只能放在 query 中
// getToken 由宿主在 preset 中提供（getUserAccessToken）
const buildAuthUrl = (baseUrl, path, params, getToken) => {
  const url = new URL(path, window.location.origin);
  if (baseUrl) {
    try {
      const staticBase = new URL(baseUrl, window.location.origin);
      url.protocol = staticBase.protocol;
      url.host = staticBase.host;
    } catch (e) {
      // keep current origin
    }
  }
  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item));
    } else if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  const token = typeof getToken === 'function' ? getToken() : null;
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
};

export default buildAuthUrl;
