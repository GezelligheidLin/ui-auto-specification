export interface UiRule {
  defaults?: Record<string, any>;
  autoPlaceholder?: boolean | ((label: string) => string);
  transform?: (props: Record<string, any>) => Record<string, any>;
}

export interface UiRules {
  [componentName: string]: UiRule;
}

export type UiLibrary = 'vant' | 'element-plus' | 'naive-ui' | 'varlet' | 'ant-design-vue';

export interface UiLibraryConfig {
  name: UiLibrary;
  prefix: string;
  packageName: string;
  exportPrefix?: string | false | ((componentName: string) => string);
  importStyle?: (componentName: string) => string | false;
  resolver?: any;
}

export interface UiEnhanceOptions {
  library: UiLibrary | UiLibraryConfig;
  rules?: UiRules;
  usePreset?: boolean;
}
