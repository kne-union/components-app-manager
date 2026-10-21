const hoursAgo = hours => new Date(Date.now() - hours * 3600 * 1000).toISOString();

const jobSchema = {
  type: 'object',
  required: ['id', 'title', 'status'],
  properties: {
    id: { type: 'string', description: '职位 ID', example: 'job-1001' },
    title: { type: 'string', description: '职位名称', example: '高级前端工程师' },
    department: { type: 'string', description: '用人部门', example: '技术部' },
    city: { type: 'string', description: '工作城市', example: '上海' },
    salaryRange: { type: 'string', description: '薪资范围', example: '30k-45k' },
    status: { type: 'string', description: '职位状态', enum: ['open', 'paused', 'closed'], example: 'open' },
    publishedAt: { type: 'string', format: 'date-time', description: '发布时间' }
  }
};

const responseOf = (schema, description = '成功') => ({
  200: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            data: schema
          }
        }
      }
    }
  },
  401: { description: '未登录或令牌失效' }
});

const pageOf = ref => ({
  type: 'object',
  properties: {
    pageData: { type: 'array', items: { $ref: ref } },
    totalCount: { type: 'integer', example: 2 }
  }
});

const openApiDocs = {
  'hr-portal': {
    openapi: '3.0.0',
    info: { title: '招聘门户', version: '1.2.0', description: '面向候选人的职位浏览、投递与面试进度查询接口' },
    tags: [
      { name: '职位', description: '职位浏览' },
      { name: '投递', description: '简历投递与进度' },
      { name: '面试', description: '面试安排' }
    ],
    paths: {
      '/api/v1/jobs': {
        get: {
          tags: ['职位'],
          summary: '职位列表',
          parameters: [
            { name: 'keyword', in: 'query', description: '职位名称关键字', schema: { type: 'string' } },
            { name: 'city', in: 'query', description: '工作城市', schema: { type: 'string' } },
            { name: 'currentPage', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'perPage', in: 'query', schema: { type: 'integer', default: 20 } }
          ],
          responses: responseOf(pageOf('#/components/schemas/Job'))
        }
      },
      '/api/v1/jobs/{id}': {
        get: {
          tags: ['职位'],
          summary: '职位详情',
          parameters: [{ name: 'id', in: 'path', required: true, description: '职位 ID', schema: { type: 'string' } }],
          responses: responseOf({ $ref: '#/components/schemas/Job' })
        }
      },
      '/api/v1/apply': {
        post: {
          tags: ['投递'],
          summary: '投递简历',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jobId', 'name', 'phone'],
                  properties: {
                    jobId: { type: 'string', description: '职位 ID', example: 'job-1001' },
                    name: { type: 'string', description: '候选人姓名', example: '张三' },
                    phone: { type: 'string', description: '手机号', example: '13800000000' },
                    resumeFileId: { type: 'string', description: '简历文件 ID' }
                  }
                }
              }
            }
          },
          responses: responseOf({ $ref: '#/components/schemas/Application' })
        }
      },
      '/api/v1/apply/progress': {
        get: {
          tags: ['投递'],
          summary: '投递进度',
          parameters: [{ name: 'applicationId', in: 'query', required: true, schema: { type: 'string' } }],
          responses: responseOf({ $ref: '#/components/schemas/Application' })
        }
      },
      '/api/v1/interviews': {
        get: {
          tags: ['面试'],
          summary: '我的面试',
          responses: responseOf({ type: 'array', items: { $ref: '#/components/schemas/Interview' } })
        }
      },
      '/api/v1/interviews/{id}/confirm': {
        post: {
          tags: ['面试'],
          summary: '确认面试时间',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: responseOf({ $ref: '#/components/schemas/Interview' })
        }
      }
    },
    components: {
      schemas: {
        Job: jobSchema,
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'apply-2001' },
            jobId: { type: 'string', example: 'job-1001' },
            stage: { type: 'string', enum: ['submitted', 'screening', 'interview', 'offer', 'rejected'], description: '当前阶段' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Interview: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'iv-3001' },
            jobTitle: { type: 'string', example: '高级前端工程师' },
            round: { type: 'integer', description: '面试轮次', example: 1 },
            startTime: { type: 'string', format: 'date-time' },
            confirmed: { type: 'boolean' }
          }
        }
      }
    }
  }
};

const buildRequest = (path, { query = [], body = '' } = {}) => ({
  target: 'app',
  baseUrl: '/app/hr-portal',
  customBaseUrl: '',
  path,
  query,
  header: [],
  body
});

const historySeed = [
  {
    id: 'h-1',
    time: hoursAgo(0.2),
    operationKey: 'get:/api/v1/jobs',
    method: 'get',
    path: '/api/v1/jobs',
    summary: '职位列表',
    url: '/app/hr-portal/api/v1/jobs?keyword=前端',
    request: buildRequest('/api/v1/jobs', { query: [{ key: 'keyword', value: '前端', enabled: true }] }),
    response: {
      status: 200,
      statusText: 'OK',
      duration: 86,
      headers: { 'content-type': 'application/json' },
      data: {
        code: 0,
        data: {
          pageData: [{ id: 'job-1001', title: '高级前端工程师', department: '技术部', city: '上海', salaryRange: '30k-45k', status: 'open' }],
          totalCount: 1
        }
      }
    }
  },
  {
    id: 'h-2',
    time: hoursAgo(1),
    operationKey: 'post:/api/v1/apply',
    method: 'post',
    path: '/api/v1/apply',
    summary: '投递简历',
    url: '/app/hr-portal/api/v1/apply',
    request: buildRequest('/api/v1/apply', { body: JSON.stringify({ jobId: 'job-1001', name: '张三', phone: '13800000000' }, null, 2) }),
    response: {
      status: 200,
      statusText: 'OK',
      duration: 142,
      headers: { 'content-type': 'application/json' },
      data: { code: 0, data: { id: 'apply-2001', jobId: 'job-1001', stage: 'submitted' } }
    }
  },
  {
    id: 'h-3',
    time: hoursAgo(26),
    operationKey: 'get:/api/v1/jobs/{id}',
    method: 'get',
    path: '/api/v1/jobs/{id}',
    summary: '职位详情',
    url: '/app/hr-portal/api/v1/jobs/job-404',
    request: buildRequest('/api/v1/jobs/job-404'),
    response: {
      status: 404,
      statusText: 'Not Found',
      duration: 35,
      headers: { 'content-type': 'application/json' },
      data: { code: 404, msg: '职位不存在' }
    }
  }
];

const caseSeed = [
  {
    id: 'c-1',
    name: '按关键字搜索前端职位',
    operationKey: 'get:/api/v1/jobs',
    request: buildRequest('/api/v1/jobs', { query: [{ key: 'keyword', value: '前端', enabled: true }] }),
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(48)
  },
  {
    id: 'c-2',
    name: '上海职位第一页',
    operationKey: 'get:/api/v1/jobs',
    request: buildRequest('/api/v1/jobs', {
      query: [
        { key: 'city', value: '上海', enabled: true },
        { key: 'currentPage', value: '1', enabled: true }
      ]
    }),
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(30)
  },
  {
    id: 'c-3',
    name: '完整信息投递',
    operationKey: 'post:/api/v1/apply',
    request: buildRequest('/api/v1/apply', {
      body: JSON.stringify({ jobId: 'job-1001', name: '张三', phone: '13800000000', resumeFileId: 'file-1' }, null, 2)
    }),
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20)
  }
];

/** 内存记录库：按 应用名 + 类型 存，刷新页面后恢复初始数据 */
const recordStore = {
  'hr-portal:history': historySeed,
  'hr-portal:case': caseSeed
};

const getRecords = (name, type) => recordStore[`${name}:${type}`] || [];

const setRecords = (name, type, list) => {
  recordStore[`${name}:${type}`] = list;
};

const matchKeyword = (item, keyword) => !keyword || [item.summary, item.path, item.url, item.name].some(text => String(text || '').includes(keyword));

const createOpenApiMock = ({ delay }) => ({
  openApi: {
    loader: ({ params } = {}) =>
      delay(openApiDocs[params?.name] || Object.assign({}, openApiDocs['hr-portal'], { info: { title: params?.name, version: '1.0.0' } }))
  },
  openApiToken: {
    loader: () => delay({ token: 'mock-open-api-token', expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() })
  },
  openApiRecords: {
    loader: ({ params = {} } = {}) => {
      const { name, type, keyword, operationKey, offset = 0, limit = 20 } = params;
      const list = getRecords(name, type).filter(item => (!operationKey || item.operationKey === operationKey) && matchKeyword(item, keyword));
      return delay({ pageData: list.slice(Number(offset), Number(offset) + Number(limit)), totalCount: list.length });
    }
  },
  openApiRecordsCount: {
    loader: ({ params = {} } = {}) =>
      delay(
        getRecords(params.name, params.type).reduce((counts, item) => {
          counts[item.operationKey] = (counts[item.operationKey] || 0) + 1;
          return counts;
        }, {})
      )
  },
  openApiRecordsSave: {
    loader: ({ data = {} } = {}) => {
      const { name, type, records = [] } = data;
      const savedIds = new Set(records.map(item => item.id));
      setRecords(name, type, [...records, ...getRecords(name, type).filter(item => !savedIds.has(item.id))]);
      return delay({});
    }
  },
  openApiRecordsRemove: {
    loader: ({ data = {} } = {}) => {
      const { name, type, ids = [], all } = data;
      setRecords(name, type, all ? [] : getRecords(name, type).filter(item => !ids.includes(item.id)));
      return delay({});
    }
  }
});

export default createOpenApiMock;
