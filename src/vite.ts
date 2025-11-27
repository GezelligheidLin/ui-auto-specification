import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';
import { setResolvedConfig, setUserProjectRoot } from './config';
import { clearEnhancedCache } from './resolver';
import type {
  UiAutoSpecificationConfig,
  UiAutoSpecificationLibraryConfig,
  UiRule,
  UiRules
} from './types';

const CONFIG_BASENAMES = ['uas.config', 'usa.config'];
const TS_EXTENSIONS = new Set(['ts', 'mts', 'cts']);
const JS_EXTENSIONS = new Set(['js', 'mjs', 'cjs']);

function findConfigFile(root: string): string | null {
  for (const base of CONFIG_BASENAMES) {
    for (const ext of TS_EXTENSIONS) {
      const candidate = path.resolve(root, `${base}.${ext}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    for (const ext of JS_EXTENSIONS) {
      const candidate = path.resolve(root, `${base}.${ext}`);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

function cacheBustingFileUrl(filePath: string): string {
  const url = pathToFileURL(filePath);
  url.searchParams.set('t', Date.now().toString(36));
  return url.href;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractConfigExport(value: unknown): unknown {
  if (isRecord(value) && 'default' in value) {
    const defaultValue = value.default;
    return defaultValue ?? value;
  }
  return value;
}

function normalizeRule(value: unknown): UiRule | null {
  if (!isRecord(value)) {
    return null;
  }

  const normalized: UiRule = {};

  if ('defaults' in value && isRecord(value.defaults)) {
    normalized.defaults = value.defaults;
  }

  if ('autoPlaceholder' in value) {
    const autoPlaceholder = value.autoPlaceholder;
    if (typeof autoPlaceholder === 'boolean') {
      normalized.autoPlaceholder = autoPlaceholder;
    } else if (typeof autoPlaceholder === 'function') {
      normalized.autoPlaceholder = autoPlaceholder as UiRule['autoPlaceholder'];
    }
  }

  if ('transform' in value && typeof value.transform === 'function') {
    normalized.transform = value.transform as UiRule['transform'];
  }

  return Object.keys(normalized).length ? normalized : {};
}

function normalizeRules(value: unknown): UiRules | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([componentName, ruleValue]) => {
      const normalizedRule = normalizeRule(ruleValue);
      return normalizedRule ? [componentName, normalizedRule] : null;
    })
    .filter((pair): pair is [string, UiRule] => pair !== null);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function normalizeLibraryConfig(value: unknown): UiAutoSpecificationLibraryConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  const normalized: UiAutoSpecificationLibraryConfig = {};

  if ('rules' in value) {
    const rules = normalizeRules(value.rules);
    if (rules) {
      normalized.rules = rules;
    }
  }

  if ('usePreset' in value && typeof value.usePreset === 'boolean') {
    normalized.usePreset = value.usePreset;
  }

  return Object.keys(normalized).length ? normalized : {};
}

function normalizeConfig(value: unknown): UiAutoSpecificationConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  const entries = Object.entries(value)
    .map(([library, configValue]) => {
      const normalized = normalizeLibraryConfig(configValue);
      return normalized ? [library, normalized] : null;
    })
    .filter((pair): pair is [string, UiAutoSpecificationLibraryConfig] => pair !== null);

  if (!entries.length) {
    return null;
  }

  return Object.fromEntries(entries);
}

async function importJavaScriptConfig(filePath: string): Promise<UiAutoSpecificationConfig | null> {
  const moduleUrl = cacheBustingFileUrl(filePath);
  const mod = (await import(moduleUrl)) as unknown;
  return normalizeConfig(extractConfigExport(mod));
}

async function importTypeScriptConfig(filePath: string): Promise<UiAutoSpecificationConfig | null> {
  try {
    const tsxModule = await import('tsx/esm/api');
    const moduleUrl = cacheBustingFileUrl(filePath);
    const result = (await tsxModule.tsImport(moduleUrl, { parentURL: moduleUrl })) as unknown;
    return normalizeConfig(extractConfigExport(result));
  } catch (error) {
    console.warn('[ui-auto-specification] Failed to load TypeScript config via tsx.', error);
    return null;
  }
}

async function loadUserConfig(configPath: string): Promise<UiAutoSpecificationConfig | null> {
  const ext = path.extname(configPath).slice(1).toLowerCase();
  if (TS_EXTENSIONS.has(ext)) {
    return importTypeScriptConfig(configPath);
  }
  return importJavaScriptConfig(configPath);
}

async function updateConfig(configPath: string | null): Promise<void> {
  if (!configPath) {
    setResolvedConfig(null);
    return;
  }
  const userConfig = await loadUserConfig(configPath);
  setResolvedConfig(userConfig);
}

function watchConfigFile(server: ViteDevServer, configPath: string, reload: () => Promise<void>) {
  server.watcher.add(configPath);

  const handleChange = (changedPath: string) => {
    if (changedPath === configPath) {
      reload()
        .then(() => {
          server.ws.send({
            type: 'custom',
            event: 'ui-auto-specification:config-update',
            data: { file: path.relative(server.config.root || process.cwd(), configPath) }
          });
        })
        .catch((error) => {
          console.warn('[ui-auto-specification] Failed to reload config.', error);
        });
    }
  };

  const handleRemoval = (removedPath: string) => {
    if (removedPath === configPath) {
      setResolvedConfig(null);
    }
  };

  server.watcher.on('change', handleChange);
  server.watcher.on('unlink', handleRemoval);
}

export function uiAutoSpecificationPlugin(): Plugin {
  let lastConfigPath: string | null = null;
  let rootDir: string | null = null;

  return {
    name: 'ui-auto-specification:plugin',
    enforce: 'pre',
    async configResolved(resolvedConfig) {
      rootDir = resolvedConfig.root ?? process.cwd();
      setUserProjectRoot(rootDir);
      lastConfigPath = findConfigFile(rootDir);
      await updateConfig(lastConfigPath);
    },
    async buildStart() {
      // 每次构建开始时清空缓存，确保使用最新配置生成组件
      clearEnhancedCache();
      console.log('[ui-auto-specification] 构建开始，已清空缓存目录');
    },
    configureServer(server) {
      if (!rootDir) {
        rootDir = server.config.root ?? process.cwd();
        setUserProjectRoot(rootDir);
      }
      if (!lastConfigPath) {
        lastConfigPath = findConfigFile(rootDir);
      }
      if (!lastConfigPath) return;
      const reload = async () => {
        await updateConfig(lastConfigPath);
      };
      watchConfigFile(server, lastConfigPath, reload);
    }
  };
}
