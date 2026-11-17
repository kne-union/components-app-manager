const resolveAdminRowId = item => {
  const id = item?.id;
  if (id == null || id === '') {
    return null;
  }
  return String(id);
};

export const goAdminDetail = (navigate, colItem, baseUrl) => {
  const id = resolveAdminRowId(colItem);
  if (!id || !navigate) {
    return;
  }
  const query = `detail?id=${encodeURIComponent(id)}`;
  if (baseUrl) {
    navigate(`${String(baseUrl).replace(/\/$/, '')}/${query}`);
    return;
  }
  navigate(query);
};

/** 详情页返回：固定进列表，不用 history.back（避免落到 Tab/iframe 历史） */
export const goAdminListBack = ({ navigate, baseUrl }) => {
  if (baseUrl) {
    navigate(baseUrl);
  }
};

export default goAdminDetail;
