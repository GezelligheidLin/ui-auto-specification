export type UiComponentProps = Record<string, unknown>;

export interface UiRule {
  defaults?: UiComponentProps;
  autoPlaceholder?: boolean | ((label: string) => string);
  transform?: (props: UiComponentProps) => UiComponentProps;
}

export interface UiRules {
  [componentName: string]: UiRule;
}

export type UiLibrary = 'vant' | 'element-plus' | 'naive-ui' | 'varlet' | 'ant-design-vue';

export interface UiAutoSpecificationLibraryConfig {
  rules?: UiRules;
  usePreset?: boolean;
}

export type UiAutoSpecificationConfig = Partial<
  Record<UiLibrary, UiAutoSpecificationLibraryConfig>
>;

export interface UiLibraryConfig {
  name: UiLibrary;
  prefix: string;
  packageName: string;
  exportPrefix?: string | false | ((componentName: string) => string);
  importStyle?: (componentName: string) => string | false;
  resolver?: unknown;
}

export interface UiEnhanceOptions {
  library: UiLibrary | UiLibraryConfig;
  rules?: UiRules;
  usePreset?: boolean;
}
