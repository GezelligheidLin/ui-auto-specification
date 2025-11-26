import { describe, it, expect, afterEach } from 'vitest';
import type { ComponentInfo, ComponentResolver } from 'unplugin-vue-components';
import { createUiEnhanceResolver, createUiEnhance } from '@/resolver';
import { setResolvedConfig } from '@/config';

async function callResolver(resolver: ComponentResolver, name: string) {
  if (typeof resolver === 'function') {
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
    const resolver = createUiEnhanceResolver({
      library: 'element-plus',
      rules: {
        ElInput: {
          defaults: {
            clearable: false
          }
        }
      },
      usePreset: false
    });

    const entry = await callResolver(resolver, 'ElInput');

    expect(entry).toBeDefined();
    assertComponentInfo(entry);
    expect(entry.name).toBe('default');
    expect(entry.from).toContain('.enhanced/ElInput.ts');
  });

  it('ignores components without rules', async () => {
    const resolver = createUiEnhanceResolver({
      library: 'element-plus',
      rules: {},
      usePreset: false
    });

    const entry = await callResolver(resolver, 'UnknownComponent');
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

    const resolver = createUiEnhance('element-plus');
    const entry = await callResolver(resolver, 'ElInput');

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
