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
import { createUiEnhance } from 'ui-auto-specification';

export default defineConfig({
  plugins: [
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

```ts
import { createUiEnhance } from 'ui-auto-specification';

const customResolver = createUiEnhance('element-plus', {
  ElInput: {
    defaults: { clearable: false },
    transform: (props) => ({ ...props, size: 'large' })
  }
});

// 结合自定义 resolver 使用
Components({ resolvers: [customResolver] });
```

### 常用选项

- `library`: UI 库名称或自定义配置
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
```

欢迎提交 Issue / PR，一起完善更多 UI 库预设或规则。

## 许可协议

MIT License © 2025 Dreamer-KJ
