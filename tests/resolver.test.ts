import { describe, it, expect, afterEach } from 'vitest';
import type {
  ComponentInfo,
  ComponentResolveResult,
  ComponentResolver,
  ComponentResolverFunction
} from '@/types/component-resolver';
import { createUiEnhanceResolver, createUiEnhance } from '@/resolver';
import { setResolvedConfig } from '@/config';

function isResolverFunction(resolver: ComponentResolver): resolver is ComponentResolverFunction {
  return typeof resolver === 'function';
}

function callResolver(resolver: ComponentResolver, name: string): ComponentResolveResult {
  if (isResolverFunction(resolver)) {
    return resolver(name);
  }
  return resolver.resolve(name);
}

function assertComponentInfo(value: unknown): asserts value is ComponentInfo {
  if (!value || typeof value === 'string') {
    throw new Error('Expected resolver result to be a component info object.');
  }
}

describe('createUiEnhanceResolver', () => {
  it('generates enhanced component files for matched rules', async () => {
    const entry = await callResolver(
      createUiEnhanceResolver({
        library: 'element-plus',
        rules: {
          ElInput: {
            defaults: {
              clearable: false
            }
          }
        },
        usePreset: false
      }),
      'ElInput'
    );

    expect(entry).toBeDefined();
    assertComponentInfo(entry);
    expect(entry.name).toBe('default');
    expect(entry.from).toContain('.enhanced/ElInput.ts');
  });

  it('ignores components without rules', async () => {
    const entry = await callResolver(
      createUiEnhanceResolver({
        library: 'element-plus',
        rules: {},
        usePreset: false
      }),
      'UnknownComponent'
    );
    expect(entry).toBeUndefined();
  });
});

describe('createUiEnhance', () => {
  afterEach(() => {
    setResolvedConfig(null);
  });

  it('pulls overrides from user config when present', async () => {
    setResolvedConfig({
      'element-plus': {
        usePreset: false,
        rules: {
          ElInput: {
            defaults: {
              clearable: false
            }
          }
        }
      }
    });

    const entry = await callResolver(createUiEnhance('element-plus'), 'ElInput');

    expect(entry).toBeDefined();
    assertComponentInfo(entry);
    expect(entry.name).toBe('default');
  });

    it('reflects config updates after resolver creation', async () => {
      setResolvedConfig(null);

      const resolver = createUiEnhance('element-plus');

      let entry = await callResolver(resolver, 'ElInput');
      expect(entry).toBeUndefined();

      setResolvedConfig({
        'element-plus': {
          usePreset: false,
          rules: {
            ElInput: {
              defaults: {
                clearable: true
              }
            }
          }
        }
      });

      entry = await callResolver(resolver, 'ElInput');
      expect(entry).toBeDefined();
      assertComponentInfo(entry);
      expect(entry.name).toBe('default');
    });
});
