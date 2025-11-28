import packageJson from '../../package.json' assert { type: 'json' };
import { recommendedConfig } from './configs/recommended';
import { requireComponentAttributesRule } from './rules/require-component-attributes';

const pluginName = 'ui-auto-specification';

interface FlatConfigCompatiblePlugin {
  meta?: {
    name?: string;
    version?: string;
  };
  rules?: Record<string, unknown>;
  configs?: Record<string, Record<string, unknown>>;
}

export const uiAutoSpecificationEslintPlugin: FlatConfigCompatiblePlugin = {
  meta: {
    name: pluginName,
    version: packageJson.version
  },
  rules: {
    'require-component-attributes': requireComponentAttributesRule
  },
  configs: {
    recommended: recommendedConfig
  }
};

export { recommendedConfig };
export { requireComponentAttributesRule };
export * from './types';
