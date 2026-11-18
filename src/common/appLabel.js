/**
 * 应用对用户显示的名称：优先取租户为应用配置的当前语言名称（labelI18n），没有则用应用 label，最后用 name。
 * labelI18n 由 app/center/list、app/center/menus 下发，仅配置过的应用才有。
 */
const getAppLabel = (item, locale) => (locale && item?.labelI18n?.[locale]) || item?.label || item?.name;

export default getAppLabel;
