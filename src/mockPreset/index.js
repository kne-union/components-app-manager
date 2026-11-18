import { message } from 'antd';
import merge from 'lodash/merge';
import { getApis } from '@components/Apis';
import createOpenApiMock from './openApi';
import createDataOpsMock from './dataOps';
import createPlatformLinkMock from './platformLink';

const now = Date.now();
const minutesAgo = minutes => new Date(now - minutes * 60 * 1000).toISOString();

const entriesOf = (name, list) => list.map(item => Object.assign({ showInCenter: true }, item, { url: `/app/${name}${item.path}` }));

const appStore = [
  {
    id: '1',
    name: 'hr-portal',
    label: '招聘门户',
    description: '面向候选人的职位浏览、投递与面试进度查询',
    icon: null,
    domain: 'jobs.example.com',
    port: 4001,
    status: 'running',
    currentVersionId: 'v-hr-3',
    category: 'recruit',
    isPublic: true,
    options: { category: 'recruit' },
    env: { ORIGIN: 'https://jobs.example.com', SMTP_PASSWORD: '********' },
    secretEnvKeys: ['SMTP_PASSWORD'],
    passthroughEnvKeys: [],
    entries: entriesOf('hr-portal', [
      { label: '候选人端', path: '/' },
      { label: '候选人移动端', path: '/mobile' },
      { label: 'HR 管理端', path: '/admin', showInCenter: false }
    ]),
    pathUrl: '/app/hr-portal/',
    createdAt: minutesAgo(60 * 24 * 30),
    updatedAt: minutesAgo(30)
  },
  {
    id: '2',
    name: 'interview-scheduler',
    label: '面试排期',
    description: '面试官日程同步与候选人自助预约',
    icon: null,
    domain: null,
    port: 4002,
    status: 'stopped',
    currentVersionId: 'v-is-1',
    category: 'recruit',
    isPublic: false,
    options: { category: 'recruit' },
    env: {},
    secretEnvKeys: [],
    passthroughEnvKeys: [],
    entries: entriesOf('interview-scheduler', [{ label: '面试排期', path: '/' }]),
    pathUrl: '/app/interview-scheduler/',
    createdAt: minutesAgo(60 * 24 * 12),
    updatedAt: minutesAgo(60 * 5)
  },
  {
    id: '3',
    name: 'talent-report',
    label: '人才报表',
    description: '招聘漏斗、渠道转化与用人部门满意度统计',
    icon: null,
    domain: null,
    port: null,
    status: 'error',
    currentVersionId: null,
    category: 'analytics',
    isPublic: true,
    options: { category: 'analytics' },
    message: 'health check timeout after 30000ms',
    env: {},
    secretEnvKeys: [],
    passthroughEnvKeys: [],
    entries: [],
    pathUrl: '/app/talent-report/',
    createdAt: minutesAgo(60 * 24 * 3),
    updatedAt: minutesAgo(10)
  }
];

const versionStore = {
  'hr-portal': [
    {
      id: 'v-hr-3',
      appName: 'hr-portal',
      version: '1.2.0',
      label: '新增面试进度查询',
      hasEnvSchema: true,
      sqlFiles: ['20261012_add_progress.sql'],
      createdAt: minutesAgo(60)
    },
    { id: 'v-hr-2', appName: 'hr-portal', version: '1.1.3', label: '修复职位搜索分页', hasEnvSchema: true, createdAt: minutesAgo(60 * 24 * 5) },
    { id: 'v-hr-1', appName: 'hr-portal', version: '1.0.0', label: '首个版本', hasEnvSchema: false, createdAt: minutesAgo(60 * 24 * 30) }
  ],
  'interview-scheduler': [
    {
      id: 'v-is-1',
      appName: 'interview-scheduler',
      version: '0.3.1',
      label: '支持企业微信日程',
      hasEnvSchema: true,
      createdAt: minutesAgo(60 * 24 * 12)
    }
  ],
  'talent-report': []
};

const findApp = name => appStore.find(item => item.name === name);

const toDetail = app =>
  Object.assign({}, app, {
    deployment: null,
    lastDeployment: null,
    pm2Config: { max_memory_restart: '512M' },
    pm2Defaults: {
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      max_restarts: 10,
      min_uptime: '5s',
      kill_timeout: 5000,
      merge_logs: true
    }
  });

export const mockApp = toDetail(appStore[0]);

// 应用中心配置的默认多语言名称，与租户为应用配置的多语言名称（租户配置优先）
const defaultLabels = { 'hr-portal': { 'zh-CN': '招聘门户', 'en-US': 'HR Portal' } };
const tenantLabels = {};

const centerItem = app => ({
  name: app.name,
  label: app.label,
  ...(defaultLabels[app.name] || tenantLabels[app.name] ? { labelI18n: Object.assign({}, defaultLabels[app.name], tenantLabels[app.name]) } : {}),
  icon: app.icon,
  description: app.description,
  category: app.category,
  isPublic: app.isPublic,
  pathUrl: app.pathUrl,
  entries: app.entries.filter(entry => entry.showInCenter)
});

const page = list => ({ pageData: list, totalCount: list.length });

const menuDeclarations = {
  'hr-portal': {
    integration: 'blank',
    menus: [
      { key: 'jobs', fullKey: 'jobs', label: '职位管理', path: '/admin/jobs' },
      { key: 'candidates', fullKey: 'candidates', label: '候选人', path: '/admin/candidates' }
    ]
  }
};

const displayModes = { 'hr-portal': 'menu' };

const delay = (result, ms = 400) => new Promise(resolve => setTimeout(() => resolve(result), ms));

const apis = merge(
  {},
  { appManager: getApis() },
  {
    appManager: {
      group: {
        groupList: {
          loader: () =>
            delay([
              { code: 'recruit', name: '招聘' },
              { code: 'analytics', name: '数据分析' }
            ])
        }
      },
      list: {
        loader: ({ params } = {}) => {
          const keyword = String(params?.filter?.keyword || params?.keyword || '').toLowerCase();
          const list = appStore.filter(
            item =>
              !keyword ||
              [item.name, item.label, item.description].some(text =>
                String(text || '')
                  .toLowerCase()
                  .includes(keyword)
              )
          );
          return delay(page(list));
        }
      },
      detail: {
        loader: ({ params } = {}) => delay(toDetail(findApp(params?.name) || appStore[0]))
      },
      ...createOpenApiMock({ delay }),
      centerList: {
        loader: () => delay(page(appStore.filter(item => item.status === 'running').map(centerItem)))
      },
      centerMenus: {
        loader: () =>
          delay(
            page(
              appStore
                .filter(item => item.status === 'running' && menuDeclarations[item.name] && displayModes[item.name] === 'menu')
                .map(item => ({
                  name: item.name,
                  label: item.label,
                  icon: item.icon,
                  kind: 'managed',
                  integration: menuDeclarations[item.name].integration,
                  baseUrl: `/app/${item.name}`,
                  version: '1.2.0',
                  menus: menuDeclarations[item.name].menus
                }))
            )
          )
      },
      centerStatus: {
        loader: ({ params } = {}) => {
          const item = findApp(params?.name);
          const healthy = !!item && item.status === 'running';
          return delay({ name: params?.name, status: item?.status || 'missing', healthy, message: healthy ? null : item?.message || null }, 200);
        }
      },
      centerToken: {
        loader: () => delay({ token: 'mock-user-token', expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() })
      },
      centerDisplaySettings: {
        loader: () =>
          delay(
            page([
              ...appStore
                .filter(item => item.status === 'running')
                .map(item => {
                  const menuCount = menuDeclarations[item.name]?.menus.length || 0;
                  return {
                    name: item.name,
                    label: item.label,
                    labelI18n: tenantLabels[item.name] || {},
                    defaultLabelI18n: defaultLabels[item.name] || {},
                    icon: item.icon,
                    kind: 'managed',
                    supportsMenu: menuCount > 0,
                    menuCount,
                    displayMode: menuCount > 0 ? displayModes[item.name] || 'center' : 'center',
                    configured: item.name in displayModes,
                    menuStatus: menuCount > 0 ? 'ok' : 'none',
                    menuError: null
                  };
                }),
              {
                name: 'notice-board',
                label: '公告栏',
                labelI18n: tenantLabels['notice-board'] || {},
                defaultLabelI18n: {},
                icon: null,
                kind: 'managed',
                supportsMenu: false,
                menuCount: 0,
                displayMode: 'center',
                configured: false,
                menuStatus: 'none',
                menuError: null
              }
            ])
          )
      },
      centerDisplaySettingsSave: {
        loader: ({ data }) => {
          if (data.displayMode !== undefined) {
            displayModes[data.name] = data.displayMode;
          }
          if (data.labelI18n !== undefined) {
            tenantLabels[data.name] = Object.fromEntries(Object.entries(data.labelI18n).filter(([, value]) => String(value).trim()));
          }
          return delay({ name: data.name, displayMode: displayModes[data.name] || null, labelI18n: tenantLabels[data.name] || {} }, 200);
        }
      },
      centerPublicList: {
        loader: () => delay(page(appStore.filter(item => item.status === 'running' && item.isPublic).map(centerItem)))
      },
      versionList: {
        loader: ({ params } = {}) => delay(page(versionStore[params?.name] || []))
      },
      envSchema: {
        loader: ({ params } = {}) =>
          delay({
            name: params?.name,
            versionId: 'v-hr-3',
            version: '1.2.0',
            hasSchema: true,
            valid: false,
            declared: [
              {
                key: 'ORIGIN',
                type: 'string',
                required: true,
                default: null,
                description: '应用对外访问地址',
                enum: null,
                secret: false,
                configured: true,
                value: 'https://jobs.example.com',
                error: null
              },
              {
                key: 'SMTP_PASSWORD',
                type: 'string',
                required: true,
                default: null,
                description: '通知邮件 SMTP 密码',
                enum: null,
                secret: true,
                configured: true,
                value: '********',
                error: null
              },
              {
                key: 'WECOM_CORP_ID',
                type: 'string',
                required: true,
                default: null,
                description: '企业微信 CorpID，用于同步面试日程',
                enum: null,
                secret: false,
                configured: false,
                value: null,
                error: 'must have required property WECOM_CORP_ID'
              },
              {
                key: 'LOG_LEVEL',
                type: 'string',
                required: false,
                default: 'info',
                description: '日志级别',
                enum: ['debug', 'info', 'warn', 'error'],
                secret: false,
                configured: false,
                value: null,
                error: null
              }
            ],
            others: []
          })
      },
      migrationList: {
        loader: () => delay(page([{ name: '20261012_add_progress.sql', status: 'pending', size: 512 }]))
      },
      logs: {
        loader: () =>
          delay({
            pageData: [
              `${minutesAgo(3)} [info] server listening at http://127.0.0.1:4001`,
              `${minutesAgo(2)} [info] GET /api/v1/jobs 200 18ms`,
              `${minutesAgo(1)} [info] POST /api/v1/apply 200 42ms`
            ],
            totalCount: 3
          })
      },
      logsFiles: {
        loader: () => delay(page([{ name: 'out.log', stream: 'out', size: 20480, mtime: minutesAgo(1), current: true }]))
      },
      ...createDataOpsMock({ delay })
    }
  }
);

const platformLinkMock = createPlatformLinkMock({ delay });

const ajax = async ({ loader, ...props }) => {
  if (loader) {
    return { data: { code: 0, data: await loader(props) } };
  }
  const linkData = await platformLinkMock.handleAjax(props);
  if (linkData) {
    if (linkData.__biz) {
      return { data: { code: linkData.code, msg: linkData.msg, data: linkData.data } };
    }
    return { data: { code: 0, data: linkData } };
  }
  message.info('示例环境：已模拟提交');
  return { data: { code: 0, data: {} } };
};

const preset = {
  ajax,
  apis,
  staticUrl: '',
  getUserAccessToken: () => 'mock-token'
};

export default preset;
