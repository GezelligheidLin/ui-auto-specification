function toPascalCase(name: string) {
  return name
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function toKebabCase(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export function normalizeComponentName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function expandComponentNameVariants(name: string) {
  const variants = new Set<string>();
  const trimmed = name.trim();
  if (!trimmed) {
    return variants;
  }
  variants.add(trimmed);
  variants.add(toKebabCase(trimmed));
  variants.add(toPascalCase(trimmed));
  return new Set(Array.from(variants).filter(Boolean));
}
