const daysAgo = days => new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

const column = (name, type, extra = {}) => Object.assign({ name, type, primaryKey: false, allowNull: true, defaultValue: null }, extra);
const idColumn = name => column(name, 'BIGINT', { primaryKey: true, allowNull: false });
const timestamps = [
  column('created_at', 'TIMESTAMP WITH TIME ZONE', { allowNull: false, defaultValue: 'now()' }),
  column('updated_at', 'TIMESTAMP WITH TIME ZONE', { allowNull: false, defaultValue: 'now()' }),
  column('deleted_at', 'TIMESTAMP WITH TIME ZONE')
];

const row = (data, createdDays, deletedDays) =>
  Object.assign({}, data, {
    created_at: daysAgo(createdDays),
    updated_at: daysAgo(Math.max(0, createdDays - 1)),
    deleted_at: deletedDays == null ? null : daysAgo(deletedDays)
  });

const jobRows = [
  ['高级前端工程师', '技术部', '上海', 30, 45, 'open', true, ['React', 'TypeScript']],
  ['Java 后端工程师', '技术部', '杭州', 25, 40, 'open', false, ['Java', 'Spring']],
  ['产品经理', '产品部', '北京', 28, 42, 'paused', false, ['B 端', '招聘 SaaS']],
  ['招聘专员', '人力资源部', '上海', 10, 15, 'open', true, ['校招']],
  ['数据分析师', '数据部', '深圳', 20, 32, 'closed', false, ['SQL', 'Python']],
  ['UI 设计师', '设计部', '上海', 18, 28, 'open', false, ['Figma']],
  ['测试工程师', '技术部', '成都', 15, 25, 'open', false, ['自动化测试']],
  ['运维工程师', '技术部', '杭州', 22, 35, 'paused', false, ['K8s', 'Linux']],
  ['HRBP', '人力资源部', '北京', 25, 38, 'open', false, ['组织发展']],
  ['销售经理', '销售部', '广州', 15, 30, 'open', true, ['大客户']],
  ['算法工程师', '数据部', '北京', 40, 60, 'open', true, ['NLP', 'LLM']],
  ['行政助理', '行政部', '上海', 8, 12, 'closed', false, []]
].map(([title, department, city, salaryMin, salaryMax, status, isUrgent, tags], index) =>
  row(
    {
      id: String(1001 + index),
      title,
      department,
      city,
      salary_min: salaryMin,
      salary_max: salaryMax,
      status,
      is_urgent: isUrgent,
      tags,
      description: `${department}招聘${title}，负责相关业务方向的建设与交付。`,
      published_on: daysAgo(40 - index * 3).slice(0, 10)
    },
    40 - index * 3,
    index === 11 ? 2 : null
  )
);

const candidates = [
  '张伟',
  '王芳',
  '李娜',
  '刘洋',
  '陈静',
  '杨磊',
  '赵敏',
  '黄强',
  '周婷',
  '吴昊',
  '徐丽',
  '孙鹏',
  '马超',
  '朱琳',
  '胡斌',
  '郭蕾',
  '何涛',
  '林雪'
];
const applicationStatus = ['submitted', 'screening', 'interview', 'offer', 'rejected'];
const sources = ['官网', 'BOSS 直聘', '猎聘', '内推', '校园招聘'];

const applicationRows = candidates.map((name, index) =>
  row(
    {
      id: String(2001 + index),
      job_id: String(1001 + (index % 10)),
      candidate_name: name,
      phone: `138${String(10000000 + index * 7919).slice(0, 8)}`,
      email: `candidate${index + 1}@example.com`,
      source: sources[index % sources.length],
      status: applicationStatus[index % applicationStatus.length],
      score: 60 + ((index * 7) % 40),
      resume: { education: index % 3 === 0 ? '硕士' : '本科', years: 1 + (index % 8), skills: ['沟通', '协作'].slice(0, 1 + (index % 2)) },
      applied_at: daysAgo(20 - index)
    },
    20 - index,
    index === 4 || index === 9 ? 1 : null
  )
);

const interviewRows = applicationRows
  .filter(item => ['interview', 'offer'].includes(item.status))
  .map((item, index) =>
    row(
      {
        id: String(3001 + index),
        application_id: item.id,
        round: 1 + (index % 3),
        interviewer: ['李经理', '王总监', '陈架构师'][index % 3],
        mode: index % 2 ? 'onsite' : 'video',
        scheduled_at: daysAgo(-1 - index),
        passed: index % 3 === 2 ? false : index % 3 === 1 ? true : null,
        feedback: index % 3 === 0 ? null : '基础扎实，沟通顺畅'
      },
      Math.max(1, 5 - index)
    )
  );

const slotRows = Array.from({ length: 8 }, (_, index) =>
  row(
    {
      id: String(4001 + index),
      interviewer: ['李经理', '王总监'][index % 2],
      start_at: daysAgo(-1 - Math.floor(index / 2)),
      duration_minutes: index % 3 ? 60 : 45,
      booked: index % 3 === 0
    },
    3
  )
);

const tableStore = {
  'hr-portal': [
    {
      table: 't_hr_job',
      columns: [
        idColumn('id'),
        column('title', 'CHARACTER VARYING(255)', { allowNull: false }),
        column('department', 'CHARACTER VARYING(64)'),
        column('city', 'CHARACTER VARYING(64)'),
        column('salary_min', 'INTEGER'),
        column('salary_max', 'INTEGER'),
        column('status', 'CHARACTER VARYING(32)', { allowNull: false, defaultValue: 'open' }),
        column('is_urgent', 'BOOLEAN', { allowNull: false, defaultValue: false }),
        column('tags', 'JSONB'),
        column('description', 'TEXT'),
        column('published_on', 'DATE'),
        ...timestamps
      ],
      rows: jobRows
    },
    {
      table: 't_hr_application',
      columns: [
        idColumn('id'),
        column('job_id', 'BIGINT', { allowNull: false }),
        column('candidate_name', 'CHARACTER VARYING(64)', { allowNull: false }),
        column('phone', 'CHARACTER VARYING(32)'),
        column('email', 'CHARACTER VARYING(128)'),
        column('source', 'CHARACTER VARYING(32)'),
        column('status', 'CHARACTER VARYING(32)', { allowNull: false, defaultValue: 'submitted' }),
        column('score', 'INTEGER'),
        column('resume', 'JSONB'),
        column('applied_at', 'TIMESTAMP WITH TIME ZONE'),
        ...timestamps
      ],
      rows: applicationRows
    },
    {
      table: 't_hr_interview',
      columns: [
        idColumn('id'),
        column('application_id', 'BIGINT', { allowNull: false }),
        column('round', 'INTEGER', { allowNull: false, defaultValue: 1 }),
        column('interviewer', 'CHARACTER VARYING(64)'),
        column('mode', 'CHARACTER VARYING(16)'),
        column('scheduled_at', 'TIMESTAMP WITH TIME ZONE'),
        column('passed', 'BOOLEAN'),
        column('feedback', 'TEXT'),
        ...timestamps
      ],
      rows: interviewRows
    }
  ],
  'interview-scheduler': [
    {
      table: 't_is_slot',
      columns: [
        idColumn('id'),
        column('interviewer', 'CHARACTER VARYING(64)', { allowNull: false }),
        column('start_at', 'TIMESTAMP WITH TIME ZONE', { allowNull: false }),
        column('duration_minutes', 'INTEGER', { allowNull: false, defaultValue: 60 }),
        column('booked', 'BOOLEAN', { allowNull: false, defaultValue: false }),
        ...timestamps
      ],
      rows: slotRows
    }
  ]
};

const SOFT_FIELD = 'deleted_at';

const findTable = (name, table) => (tableStore[name] || []).find(item => item.table === table);

const parseJson = value => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

const compare = (a, b) => {
  if (a == null) {
    return b == null ? 0 : -1;
  }
  if (b == null) {
    return 1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'zh-CN', { numeric: true });
};

const matchFilter = (item, filter) =>
  Object.keys(filter || {}).every(key => {
    const cond = filter[key];
    const value = item[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if (cond.$gte != null && compare(value, cond.$gte) < 0) {
        return false;
      }
      return !(cond.$lte != null && compare(value, cond.$lte) > 0);
    }
    return String(value) === String(cond);
  });

const matchKeyword = (item, keyword) =>
  !keyword ||
  Object.keys(item)
    .filter(key => key !== SOFT_FIELD)
    .some(key => {
      const value = item[key];
      return value != null && (typeof value === 'object' ? JSON.stringify(value) : String(value)).toLowerCase().includes(keyword);
    });

const pickPk = (meta, pk) => item => meta.columns.filter(col => col.primaryKey).every(col => String(item[col.name]) === String(pk?.[col.name]));

let idSeed = Date.now();

const createDataOpsMock = ({ delay }) => ({
  dbTables: {
    loader: ({ params } = {}) => {
      const list = tableStore[params?.name] || [];
      return delay({
        dbScope: 'shared',
        softDeleteField: SOFT_FIELD,
        connection: { dialect: 'postgres', host: '127.0.0.1', port: '5432', database: 'app_platform', hasCustomDb: false },
        ownedTables: list.map(item => item.table),
        pageData: list.map(({ table, columns }) => ({ table, columns, primaryKey: columns.filter(col => col.primaryKey).map(col => col.name) })),
        totalCount: list.length
      });
    }
  },
  dbRows: {
    loader: ({ params } = {}) => {
      const meta = findTable(params?.name, params?.table);
      if (!meta) {
        return delay({ pageData: [], totalCount: 0 });
      }
      const showDeleted = params.includeDeleted === true || params.includeDeleted === 'true';
      const keyword = String(params.keyword || '')
        .trim()
        .toLowerCase();
      const filter = parseJson(params.filter);
      const sort = parseJson(params.sort) || [];
      const list = meta.rows.filter(item => (showDeleted || item[SOFT_FIELD] == null) && matchKeyword(item, keyword) && matchFilter(item, filter));
      sort
        .slice()
        .reverse()
        .forEach(({ name, field, sort: dir, order }) => {
          const key = name || field;
          const desc = String(dir || order || 'ASC').toUpperCase() === 'DESC';
          list.sort((a, b) => (desc ? -1 : 1) * compare(a[key], b[key]));
        });
      const currentPage = Math.max(1, Number(params.currentPage) || 1);
      const perPage = Math.max(1, Number(params.perPage) || 20);
      const start = (currentPage - 1) * perPage;
      return delay({
        pageData: list.slice(start, start + perPage),
        totalCount: list.length,
        primaryKey: meta.columns.filter(col => col.primaryKey).map(col => col.name),
        columns: meta.columns,
        softDeleteField: SOFT_FIELD,
        softDeleteSupported: true
      });
    }
  },
  dbRowSave: {
    loader: ({ data } = {}) => {
      const meta = findTable(data?.name, data?.table);
      if (!meta) {
        return delay({});
      }
      const payload = Object.assign({}, data.data);
      Object.keys(data.autoGenerate || {}).forEach(key => {
        if (data.autoGenerate[key]) {
          payload[key] = String((idSeed += 1));
        }
      });
      const pkNames = meta.columns.filter(col => col.primaryKey).map(col => col.name);
      const target = meta.rows.find(pickPk(meta, payload));
      const now = new Date().toISOString();
      if (target) {
        Object.assign(target, payload, { updated_at: now });
      } else {
        const created = Object.assign({}, payload, { created_at: now, updated_at: now, [SOFT_FIELD]: null });
        meta.rows.unshift(created);
      }
      return delay({ data: Object.fromEntries(pkNames.map(key => [key, payload[key]])) });
    }
  },
  dbRowRemove: {
    loader: ({ data } = {}) => {
      const meta = findTable(data?.name, data?.table);
      const target = meta && meta.rows.find(pickPk(meta, data.pk));
      if (target) {
        target[SOFT_FIELD] = new Date().toISOString();
      }
      return delay({ ok: true, mode: 'soft', softDeleteField: SOFT_FIELD });
    }
  },
  dbRowRestore: {
    loader: ({ data } = {}) => {
      const meta = findTable(data?.name, data?.table);
      const target = meta && meta.rows.find(pickPk(meta, data.pk));
      if (target) {
        target[SOFT_FIELD] = null;
      }
      return delay({ ok: true, softDeleteField: SOFT_FIELD });
    }
  },
  dbQuery: {
    loader: ({ data } = {}) => {
      const sql = String(data?.sql || '').trim();
      const tableName = (sql.match(/\bfrom\s+["`]?(\w+)["`]?/i) || [])[1];
      const meta = /^select\b/i.test(sql) && findTable(data?.name, tableName);
      if (!meta) {
        return delay({ columns: ['affected_rows'], rows: [{ affected_rows: 0 }], rowCount: 1, truncated: false });
      }
      const sqlLimit = Number((sql.match(/\blimit\s+(\d+)/i) || [])[1]);
      const limit = sqlLimit || 1000;
      const rows = meta.rows.filter(item => item[SOFT_FIELD] == null);
      return delay({
        columns: meta.columns.map(col => col.name),
        rows: rows.slice(0, limit),
        rowCount: Math.min(rows.length, limit),
        truncated: !sqlLimit && rows.length > limit
      });
    }
  }
});

export default createDataOpsMock;
