import { defineComponent, h } from 'vue';
import type { UiRule } from '../types';

export function withUiRules(componentName: string, OriginalComponent: any, rule: UiRule) {
  return defineComponent({
    name: `UiEnhanced_${componentName}`,
    inheritAttrs: false,
    setup(props, { attrs, slots }) {
      return () => {
        const finalProps: Record<string, any> = {
          ...rule.defaults,
          ...attrs,
          ...props
        };

        const transformedProps = rule.transform ? rule.transform(finalProps) : finalProps;

        if (rule.autoPlaceholder && !transformedProps.placeholder) {
          const label = transformedProps.label ?? '';
          if (label) {
            transformedProps.placeholder =
              typeof rule.autoPlaceholder === 'function'
                ? rule.autoPlaceholder(label)
                : `请输入${label}`;
          }
        }

        return h(OriginalComponent, transformedProps, slots);
      };
    }
  });
}
