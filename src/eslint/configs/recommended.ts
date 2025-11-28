import type { RequireComponentAttributesRuleOptions } from '../types';

const defaultOptions: RequireComponentAttributesRuleOptions = {
  libraries: [
    {
      name: 'element-plus',
      components: [
        {
          component: 'ElInput',
          matchNames: ['el-input'],
          attributes: [
            {
              name: 'maxlength',
              reason: '统一输入上限，防止超长数据写入后端'
            },
            {
              name: 'show-word-limit',
              reason: '搭配 maxlength 展示字数提示',
              allowEmpty: true
            }
          ]
        },
        {
          component: 'ElInputNumber',
          matchNames: ['el-input-number'],
          attributes: [
            {
              name: 'max',
              reason: '数值型输入必须设置 max 防止越界'
            },
            {
              name: 'min',
              reason: '数值型输入必须设置 min 防止越界'
            }
          ]
        }
      ]
    }
  ]
};

export const recommendedConfig = {
  name: 'ui-auto-specification/recommended',
  plugins: ['ui-auto-specification'],
  rules: {
    'ui-auto-specification/require-component-attributes': ['warn', defaultOptions]
  }
} as const;
