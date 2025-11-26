import type {
  UiAutoSpecificationConfig,
  UiAutoSpecificationLibraryConfig,
  UiLibrary
} from './types';

type ResolvedLibraryConfig = Partial<Record<UiLibrary, UiAutoSpecificationLibraryConfig>>;

let resolvedConfig: ResolvedLibraryConfig | null = null;
let userProjectRoot = process.cwd();

export function defineUasConfig(config: UiAutoSpecificationConfig): UiAutoSpecificationConfig {
  return config;
}

export function setUserProjectRoot(root: string) {
  userProjectRoot = root;
}

export function getUserProjectRoot() {
  return userProjectRoot;
}

export function setResolvedConfig(config?: ResolvedLibraryConfig | null) {
  resolvedConfig = config ?? null;
}

export function getResolvedConfig(): ResolvedLibraryConfig | null {
  return resolvedConfig;
}

export function getLibraryUserConfig(library: UiLibrary): unknown {
  return resolvedConfig?.[library];
}
