import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import vueParser from 'vue-eslint-parser';
import { requireComponentAttributesRule } from '@/eslint';
import type { RequireComponentAttributesRuleOptions } from '@/eslint/types';

const ruleId = 'ui-auto-specification/require-component-attributes';

const linter = new Linter({ configType: 'eslintrc' });
linter.defineParser('vue-eslint-parser', vueParser as unknown as Linter.Parser);
linter.defineRule(ruleId, requireComponentAttributesRule);

const defaultOptions: RequireComponentAttributesRuleOptions = {
  components: [
    {
      component: 'ElInput',
      matchNames: ['el-input'],
      attributes: [
        'maxlength',
        { name: 'show-word-limit', allowEmpty: true }
      ]
    }
  ]
};

function runRule(code: string, options: RequireComponentAttributesRuleOptions = defaultOptions) {
  return linter.verify(
    code,
    {
      parser: 'vue-eslint-parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      rules: {
        [ruleId]: ['error', options]
      }
    },
    'component.vue'
  );
}

describe('require-component-attributes rule', () => {
  it('reports missing attributes on Element Plus input', () => {
    const result = runRule(`
      <template>
        <el-input />
      </template>
    `);

    expect(result).toHaveLength(2);
    const [first, second] = result;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.message).toContain('maxlength');
    expect(second!.message).toContain('show-word-limit');
  });

  it('accepts components with required attributes', () => {
    const result = runRule(`
      <template>
        <el-input maxlength="50" show-word-limit />
      </template>
    `);

    expect(result).toHaveLength(0);
  });

  it('treats bound attributes as valid values', () => {
    const result = runRule(`
      <template>
        <el-input :maxlength="limit" show-word-limit />
      </template>
    `);

    expect(result).toHaveLength(0);
  });

  it('allows configuring additional libraries', () => {
    const result = runRule(
      `
        <template>
          <van-field />
        </template>
      `,
      {
        components: [],
        libraries: [
          {
            name: 'vant',
            components: [
              {
                component: 'VanField',
                matchNames: ['van-field'],
                attributes: [
                  {
                    name: 'maxlength',
                    reason: 'Form inputs need consistent limit'
                  }
                ]
              }
            ]
          }
        ]
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.message).toContain('maxlength');
    expect(result[0]?.message).toContain('VanField');
  });
});
