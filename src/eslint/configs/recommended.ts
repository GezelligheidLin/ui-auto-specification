import type { RequireComponentAttributesRuleOptions } from '../types';

const defaultOptions: RequireComponentAttributesRuleOptions = {};

export const recommendedConfig = {
  name: 'ui-auto-specification/recommended',
  plugins: ['ui-auto-specification'],
  rules: {
    'ui-auto-specification/require-component-attributes': ['warn', defaultOptions]
  }
} as const;
