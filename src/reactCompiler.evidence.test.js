const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

describe('React Compiler：原生开关且产生有效 transform', () => {
  test('craco 只用 modules-dev 原生 reactCompiler.target=19，业务 package 不单独装编译器插件', () => {
    // 读源文件而不 require craco.config.js：配置会加载 modules-dev 全量入口，在 Jest jsdom 下触发 TextEncoder 缺失。
    const cracoSrc = fs.readFileSync(path.join(root, 'craco.config.js'), 'utf8');
    expect(cracoSrc).toMatch(/reactCompiler:\s*\{\s*target:\s*'19'\s*\}/);
    expect(cracoSrc).toMatch(/CracoRemoteComponentsPlugin/);
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const all = Object.assign({}, pkg.dependencies, pkg.devDependencies);
    expect(all['babel-plugin-react-compiler']).toBeUndefined();
    expect(all['react-compiler-runtime']).toBeUndefined();
  });

  test('官方插件把 babel-plugin-react-compiler 注入到 CRA 应用 babel-loader，且编译器能改写组件', () => {
    const {
      buildCompilerConfig,
      resolveCompilerPlugin,
      overrideWebpackConfig,
      getCompilerSharedEntries,
      assertReact19Runtime
    } = require('@kne/modules-dev/lib/craco-react-compiler-plugin');
    const compilerConfig = buildCompilerConfig({ target: '19' });
    expect(compilerConfig.target).toBe('19');
    expect(compilerConfig.compilerOptions.target).toBe('19');
    const pluginPath = resolveCompilerPlugin(compilerConfig.pluginName);
    expect(pluginPath).toMatch(/babel-plugin-react-compiler/);
    assertReact19Runtime('19');

    const webpackConfig = {
      module: {
        rules: [
          {
            oneOf: [
              {
                loader: '/virtual/babel-loader/index.js',
                options: {
                  presets: ['/virtual/babel-preset-react-app/index.js'],
                  plugins: []
                }
              },
              {
                loader: '/virtual/babel-loader/index.js',
                options: {
                  presets: ['/virtual/babel-preset-react-app/dependencies.js'],
                  plugins: []
                }
              }
            ]
          }
        ]
      }
    };
    overrideWebpackConfig({ webpackConfig, pluginOptions: { reactCompiler: { target: '19' } }, cracoConfig: {} });
    const app = webpackConfig.module.rules[0].oneOf[0].options;
    const dep = webpackConfig.module.rules[0].oneOf[1].options;
    expect(app.plugins[0][0]).toBe(pluginPath);
    expect(app.plugins[0][1]).toEqual(compilerConfig.compilerOptions);
    expect(String(app.cacheIdentifier)).toMatch(/react-compiler-/);
    expect((dep.plugins || []).length).toBe(0);

    const shared = getCompilerSharedEntries('19');
    expect(shared['react/compiler-runtime']).toEqual({ singleton: true, requiredVersion: false });

    const babel = require('@babel/core');
    const src = `function Counter({ count }) {\n  const doubled = count * 2;\n  return <div>{doubled}</div>;\n}\nexport default Counter;\n`;
    const result = babel.transformSync(src, {
      filename: 'Counter.js',
      plugins: [[pluginPath, compilerConfig.compilerOptions]],
      presets: [[require.resolve('@babel/preset-react'), { runtime: 'automatic' }]],
      babelrc: false,
      configFile: false,
      compact: false
    });
    expect(result.code).toMatch(/react\/compiler-runtime/);
    expect(result.code).toMatch(/_c\(/);
    expect(result.code).toMatch(/const \$ = _c\(/);
  });

  test('若存在 compile 产物，其中含 compiler-runtime 引用与 memo_cache 改写标记', () => {
    const buildDir = path.join(root, 'build');
    if (!fs.existsSync(buildDir)) {
      return;
    }
    const walk = dir => {
      const out = [];
      if (!fs.existsSync(dir)) return out;
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.(js|mjs)$/.test(name)) out.push(full);
      }
      return out;
    };
    const files = walk(path.join(buildDir, 'static')).concat(walk(buildDir).filter(f => /\.(js|mjs)$/.test(f)));
    const unique = [...new Set(files)];
    const hasRuntime = unique.some(file => fs.readFileSync(file, 'utf8').includes('react/compiler-runtime'));
    const hasTransform = unique.some(file => {
      const text = fs.readFileSync(file, 'utf8');
      return text.includes('react.memo_cache_sentinel') || text.includes('useMemoCache');
    });
    expect(hasRuntime).toBe(true);
    expect(hasTransform).toBe(true);
  });
});

describe('版本与依赖契约', () => {
  test('package 为尚未占用的 0.1.2，react/antd/modules-dev 指向最新稳定', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.version).toBe('0.1.2');
    expect(pkg.devDependencies.react).toBe('^19.3.1');
    expect(pkg.devDependencies['react-dom']).toBe('^19.3.1');
    expect(pkg.devDependencies['@kne/modules-dev']).toBe('^2.4.21');
    expect(pkg.devDependencies.antd).toMatch(/^\^6\./);
  });
});
