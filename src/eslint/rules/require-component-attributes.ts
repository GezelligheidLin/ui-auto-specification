import type { Rule, SourceCode } from 'eslint';
import { expandComponentNameVariants, normalizeComponentName } from '../utils/naming';
import type {
  AttributeRequirement,
  ComponentAttributeRule,
  ComponentRuleGroup,
  RequireComponentAttributesRuleOptions
} from '../types';

interface IdentifierNode {
  name: string;
}

interface LiteralNode {
  value: string;
}

function toRuleNode(value: unknown) {
  return value as Rule.Node;
}

function isTemplateElement(value: unknown): value is TemplateElement {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const casted = value as TemplateElement;
  return typeof casted.startTag === 'object' && casted.startTag !== null;
}

interface DirectiveKeyNode {
  name: IdentifierNode;
  argument?: DirectiveIdentifierNode | null;
}

interface DirectiveIdentifierNode extends IdentifierNode {
  type?: string;
}

interface BaseAttributeNode {
  directive: boolean;
}

interface PlainAttributeNode extends BaseAttributeNode {
  directive: false;
  key: IdentifierNode;
  value: LiteralNode | null;
}

interface BoundAttributeNode extends BaseAttributeNode {
  directive: true;
  key: DirectiveKeyNode;
  value: unknown;
}

type TemplateAttribute = PlainAttributeNode | BoundAttributeNode;

interface TemplateElement {
  rawName?: string;
  name?: string;
  startTag: {
    attributes?: TemplateAttribute[];
  };
}

interface TemplateParserServices {
  defineTemplateBodyVisitor?: (
    templateBodyVisitor: Record<string, (node: unknown) => void>,
    scriptVisitor?: Rule.RuleListener,
    fallbackScriptVisitor?: Rule.RuleListener
  ) => Rule.RuleListener;
}

interface NormalizedAttributeRequirement extends AttributeRequirement {
  name: string;
}

interface NormalizedComponentRule extends ComponentAttributeRule {
  names: Set<string>;
  attributes: NormalizedAttributeRequirement[];
}

function normalizeAttributes(attributes: ComponentAttributeRule['attributes']) {
  return attributes.map((attr) =>
    typeof attr === 'string'
      ? { name: attr }
      : {
          ...attr,
          name: attr.name
        }
  );
}

function flattenGroups(groups: ComponentRuleGroup[] = []): ComponentAttributeRule[] {
  const flattened: ComponentAttributeRule[] = [];
  for (const group of groups) {
    for (const component of group.components) {
      flattened.push({
        ...component,
        library: group.name
      });
    }
  }
  return flattened;
}

function buildComponentMap(options?: RequireComponentAttributesRuleOptions) {
  const components = [
    ...(options?.components ?? []),
    ...flattenGroups(options?.libraries)
  ];

  const map = new Map<string, NormalizedComponentRule>();

  for (const componentRule of components) {
    if (!componentRule || !componentRule.attributes?.length) {
      continue;
    }
    const variants = new Set<string>();
    for (const variant of expandComponentNameVariants(componentRule.component)) {
      variants.add(normalizeComponentName(variant));
    }
    for (const extra of componentRule.matchNames ?? []) {
      variants.add(normalizeComponentName(extra));
    }

    if (!variants.size) {
      continue;
    }

    const normalizedRule: NormalizedComponentRule = {
      ...componentRule,
      names: variants,
      attributes: normalizeAttributes(componentRule.attributes)
    };

    for (const key of variants) {
      map.set(key, normalizedRule);
    }
  }

  return map;
}

function getElementName(node: TemplateElement) {
  return node.rawName || node.name || '';
}

function isDirective(attr: TemplateAttribute): attr is BoundAttributeNode {
  return attr.directive;
}

function getAttributeName(attr: TemplateAttribute) {
  if (!isDirective(attr)) {
    return attr.key.name;
  }
  const directiveName = attr.key.name.name;
  if (directiveName !== 'bind') {
    return '';
  }
  const arg = attr.key.argument;
  if (arg && arg.type === 'VIdentifier' && arg.name) {
    return arg.name;
  }
  return '';
}

function attributeValueIsEmpty(attr: TemplateAttribute) {
  if (isDirective(attr)) {
    return false;
  }
  if (!attr.value) {
    return true;
  }
  return attr.value.value.trim().length === 0;
}

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: '要求指定 UI 组件必须声明关键属性，例如 Element Plus 的 <el-input> 需要 maxlength。',
      recommended: false
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          components: {
            type: 'array',
            items: {
              type: 'object',
              required: ['component', 'attributes'],
              properties: {
                component: { type: 'string' },
                matchNames: {
                  type: 'array',
                  items: { type: 'string' }
                },
                displayName: { type: 'string' },
                library: { type: 'string' },
                attributes: {
                  type: 'array',
                  items: {
                    anyOf: [
                      { type: 'string' },
                      {
                        type: 'object',
                        required: ['name'],
                        properties: {
                          name: { type: 'string' },
                          allowEmpty: { type: 'boolean' },
                          reason: { type: 'string' },
                          suggestion: { type: 'string' }
                        },
                        additionalProperties: false
                      }
                    ]
                  },
                  minItems: 1
                }
              },
              additionalProperties: false
            }
          },
          libraries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'components'],
              properties: {
                name: { type: 'string' },
                components: {
                  type: 'array',
                  items: { $ref: '#/properties/components/items' }
                }
              },
              additionalProperties: false
            }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingAttribute: 'Component <{{component}}> must define attribute "{{attribute}}"{{reason}}.'
    }
  },
  create(context: Rule.RuleContext) {
    const componentMap = buildComponentMap(
      (context.options?.[0] as RequireComponentAttributesRuleOptions | undefined) ?? undefined
    );
    if (!componentMap.size) {
      return {};
    }

    const sourceCode: SourceCode = context.sourceCode ?? context.getSourceCode();
    const parser = sourceCode.parserServices as TemplateParserServices | undefined;
    if (!parser?.defineTemplateBodyVisitor) {
      return {};
    }

    const visitTemplateElement = (node: unknown) => {
      if (!isTemplateElement(node)) {
        return;
      }

      const tagName = getElementName(node);
      if (!tagName) {
        return;
      }
      const normalized = normalizeComponentName(tagName);
      const config = componentMap.get(normalized);
      if (!config) {
        return;
      }

      const attrs: TemplateAttribute[] = node.startTag.attributes ?? [];

      for (const required of config.attributes) {
        const attrNode = attrs.find((attr) => getAttributeName(attr) === required.name);
        if (!attrNode) {
          context.report({
            node: toRuleNode(node.startTag),
            messageId: 'missingAttribute',
            data: {
              component: config.displayName ?? config.component,
              attribute: required.name,
              reason: required.reason ? ` (${required.reason})` : ''
            }
          });
          continue;
        }

        if (!required.allowEmpty && attributeValueIsEmpty(attrNode)) {
          context.report({
            node: toRuleNode(attrNode),
            messageId: 'missingAttribute',
            data: {
              component: config.displayName ?? config.component,
              attribute: required.name,
              reason: required.reason ? ` (${required.reason})` : ''
            }
          });
        }
      }
    };

    return parser.defineTemplateBodyVisitor({
      VElement: visitTemplateElement
    });
  }
};

export const requireComponentAttributesRule = rule;
