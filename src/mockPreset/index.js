import { message } from 'antd';
import merge from 'lodash/merge';
import { getApis } from '@components/Apis';
import createOpenApiMock from './openApi';
import createDataOpsMock from './dataOps';

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

const centerItem = app => ({
  name: app.name,
  label: app.label,
  icon: app.icon,
  description: app.description,
  category: app.category,
  isPublic: app.isPublic,
  pathUrl: app.pathUrl,
  entries: app.entries.filter(entry => entry.showInCenter)
});

const page = list => ({ pageData: list, totalCount: list.length });

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

const ajax = async ({ loader, ...props }) => {
  if (loader) {
    return { data: { code: 0, data: await loader(props) } };
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
