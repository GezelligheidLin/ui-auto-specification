import { defineComponent, h } from 'vue';
import type { Component, SetupContext } from 'vue';
import type { UiRule, UiComponentProps } from '@/types';

function mergeProps(target: UiComponentProps, source?: Record<string, unknown>) {
  if (!source) {
    return;
  }
  for (const [key, value] of Object.entries(source)) {
    Reflect.set(target, key, value);
  }
}

export function withUiRules(componentName: string, OriginalComponent: Component, rule: UiRule) {
  return defineComponent({
    name: `UiEnhanced_${componentName}`,
    inheritAttrs: false,
    setup(props: UiComponentProps, { attrs, slots }: SetupContext) {
      return () => {
        let enhancedProps: UiComponentProps = {};
        const normalizedAttrs = attrs as Record<string, unknown>;
        mergeProps(enhancedProps, rule.defaults);
        mergeProps(enhancedProps, normalizedAttrs);
        mergeProps(enhancedProps, props);

        if (typeof rule.transform === 'function') {
          enhancedProps = rule.transform(enhancedProps);
        }

        if (rule.autoPlaceholder) {
          const currentPlaceholder = Reflect.get(enhancedProps, 'placeholder') as string | undefined;
          if (!currentPlaceholder) {
            const label = (Reflect.get(enhancedProps, 'label') as string | undefined) ?? '';
            if (label) {
              const placeholderText =
                typeof rule.autoPlaceholder === 'function'
                  ? rule.autoPlaceholder(label)
                  : `请输入${label}`;
              Reflect.set(enhancedProps, 'placeholder', placeholderText);
            }
          }
        }

        return h(OriginalComponent, enhancedProps, slots);
      };
    }
  });
}
