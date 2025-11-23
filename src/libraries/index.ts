import type { UiLibrary, UiLibraryConfig } from '../types';

const stripPrefix = (componentName: string, prefix: string) =>
  componentName.startsWith(prefix) ? componentName.slice(prefix.length) : componentName;

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const UI_LIBRARIES: Record<UiLibrary, UiLibraryConfig> = {
  vant: {
    name: 'vant',
    prefix: 'Van',
    packageName: 'vant',
    exportPrefix: false,
    importStyle: (componentName) => {
      const name = toKebabCase(stripPrefix(componentName, 'Van'));
      return `vant/es/${name}/style`;
    }
  },
  'element-plus': {
    name: 'element-plus',
    prefix: 'El',
    packageName: 'element-plus',
    exportPrefix: 'El',
    importStyle: (componentName) => {
      const name = toKebabCase(stripPrefix(componentName, 'El'));
      return `element-plus/es/components/${name}/style/css`;
    }
  },
  'naive-ui': {
    name: 'naive-ui',
    prefix: 'N',
    packageName: 'naive-ui',
    exportPrefix: 'N',
    importStyle: () => false
  },
  varlet: {
    name: 'varlet',
    prefix: 'Var',
    packageName: '@varlet/ui',
    exportPrefix: false,
    importStyle: (componentName) => {
      const name = toKebabCase(stripPrefix(componentName, 'Var'));
      return `@varlet/ui/es/${name}/style`;
    }
  },
  'ant-design-vue': {
    name: 'ant-design-vue',
    prefix: 'A',
    packageName: 'ant-design-vue',
    exportPrefix: false,
    importStyle: (componentName) => {
      const name = toKebabCase(stripPrefix(componentName, 'A'));
      return `ant-design-vue/es/${name}/style`;
    }
  }
};

export function getLibraryConfig(library: UiLibrary | UiLibraryConfig): UiLibraryConfig {
  return typeof library === 'string' ? UI_LIBRARIES[library] : library;
}
