# ui-auto-specification

一个面向 Vue 3 + `unplugin-vue-components` 的增强型组件解析器。它在按需引入组件的同时自动注入常用默认属性、占位提示，并内置多套 UI 库预设，帮助团队快速统一「表单规范」「交互体验」。

## 功能亮点

- 🔌 无缝兼容 `unplugin-vue-components`，仅需一个 resolver 即可启用
- 🧱 内置 Element Plus、Naive UI、Vant、Varlet、Ant Design Vue 等常用库的规则预设
- ✨ 自动合并默认属性、生成 placeholder、执行自定义 `transform`
- 🌲 每个组件在首次解析时动态生成增强文件，天然支持 tree-shaking
- ⚙️ npm-quick-template 驱动，提供完整的 TypeScript、Lint、Test、Docs 流程

## 安装

```bash
npm install ui-auto-specification unplugin-vue-components
# 或者使用 pnpm / yarn
```

## 快速上手

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { createUiEnhance, uiAutoSpecificationPlugin } from 'ui-auto-specification';

export default defineConfig({
  plugins: [
    uiAutoSpecificationPlugin(),
    Components({
      resolvers: [
        // 使用内置预设（Element Plus）
        createUiEnhance('element-plus')
      ]
    })
  ]
});
```

## 进阶配置

### 项目级配置文件

插件会在项目根目录查找 `uas.config.*` 或 `usa.config.*`（支持 `ts/mts/cts/js/mjs/cjs`）。
在该文件中使用 `defineUasConfig` 描述各 UI 库的规则与开关：

```ts
// uas.config.ts
import { defineUasConfig } from 'ui-auto-specification';

export default defineUasConfig({
  'element-plus': {
    usePreset: true,
    rules: {
      ElInput: {
        defaults: { clearable: false },
        transform: (props) => ({ ...props, size: 'large' })
      }
    }
  }
});

```

启用 `uiAutoSpecificationPlugin()` 后，`createUiEnhance('element-plus')` 会自动读取该配置；
如果没有配置文件，则回退到预设行为。

> 提示：即使 Vite 插件稍后才加载配置，也无需重新声明 resolver——`createUiEnhance` 会在每次解析组件时获取最新的 `uas.config.*` 内容。

### 常用配置键

- `library`: `createUiEnhance` 的 UI 库名称或自定义配置
- `rules`: 针对组件的自定义规则表
- `usePreset`: 是否启用内置预设（默认 `true`）

## 目录结构

```
ui-auto-specification/
├─ src/
│  ├─ core/withUiRules.ts    # 封装组件增强逻辑
│  ├─ libraries/             # UI 库元数据
│  ├─ presets/               # 预设规则
│  └─ resolver/              # 与 unplugin 兼容的解析器
├─ tests/                    # Vitest 用例
├─ examples/                 # 代码示例
└─ ...
```

## 开发脚本

```bash
npm run dev       # tsup watch 模式
npm run build     # 产出 ESM/CJS + d.ts
npm run test      # Vitest
npm run lint      # ESLint + TypeScript 检查
npm run docs      # 生成 API 文档（Typedoc）
```

## 常见问题
```markdown
Q: 如何添加新的 UI 库预设？
A: 在 `src/presets/` 目录下创建新的预设文件，定义组件规则后导出即可。

Q: 能否自定义组件的默认属性？
A: 可以，通过 `rules` 选项为指定组件配置 `defaults` 和 `transform` 函数。

Q: 组件增强文件生成在哪里？
A: 生成在项目的node_modules/.cache/ui-auto-specification/.enhanced目录中。

Q: 为什么在 Vite 6+ 中使用 Element Plus 会报 `dayjs` 相关错误？
A: Vite 6 开始对 ESM 条件解析更严格，Element Plus 在内部引用 `dayjs` 插件时会落到 CommonJS 入口（如 `dayjs/plugin/utc.js`），Vite 会报「Failed to resolve import」或在运行期触发 `require` 未定义。解决方法是在 `vite.config.ts` 中把 `dayjs` 及其插件指向官方 ESM 版本，并确保在 `optimizeDeps.include` 中预构建 `dayjs`：
1. 使用 `createRequire` 定位 `dayjs/esm/index.js` 并记录其目录。
2. 在 `resolve.alias` 添加 `{ find: /^dayjs$/, replacement: dayjsEsmIndex }` 锁主入口。
3. 添加 `{ find: /^dayjs\/plugin\/(.*)\.js$/, replacement: \`${dayjsEsmRoot}/plugin/$1/index.js\` }` 让插件引用落到 `esm` 目录，并在 `optimizeDeps.include` 中包含 `dayjs`，即可在 Vite 6+ 正常使用 Element Plus。

```ts
// vite.config.ts 示意
import { createRequire } from 'node:module'
import path from 'node:path'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)
const dayjsEsmIndex = require.resolve('dayjs/esm/index.js')
const dayjsEsmRoot = path.dirname(dayjsEsmIndex)

export default defineConfig({
  resolve: {
    alias: [
      { find: /^dayjs$/, replacement: dayjsEsmIndex },
      { find: /^dayjs\/plugin\/(.*)\.js$/, replacement: `${dayjsEsmRoot}/plugin/$1/index.js` },
    ],
  },
  optimizeDeps: {
    include: ['dayjs'],
  },
})
```
```

欢迎提交 Issue / PR，一起完善更多 UI 库预设或规则。

## 许可协议

MIT License © 2025 Dreamer-KJ
