import { describe, it, expect } from 'vitest';
import { createUiEnhanceResolver } from '../src/resolver';

describe('createUiEnhanceResolver', () => {
  it('generates enhanced component files for matched rules', () => {
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

    const entry = resolver.resolve?.('ElInput');

    expect(entry).toBeDefined();
    expect(entry?.name).toBe('default');
    expect(entry?.from).toContain('.enhanced/ElInput.ts');
  });

  it('ignores components without rules', () => {
    const resolver = createUiEnhanceResolver({
      library: 'element-plus',
      rules: {},
      usePreset: false
    });

    const entry = resolver.resolve?.('UnknownComponent');
    expect(entry).toBeUndefined();
  });
});
