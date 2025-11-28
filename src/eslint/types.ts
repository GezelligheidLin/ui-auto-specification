export interface AttributeRequirement {
  name: string;
  /**
   * Allow the attribute to exist without value (boolean attr or empty string).
   * Defaults to false which means empty values will still be reported.
   */
  allowEmpty?: boolean;
  /** Optional short reason appended to lint message. */
  reason?: string;
  /** Suggestion text shown in documentation or autofix hints. */
  suggestion?: string;
}

export interface ComponentAttributeRule {
  /** Component tag or PascalCase component name. */
  component: string;
  /**
   * Additional tag aliases (e.g. both `el-input` 与 `ElInput`)，会自动做大小写/连字符归一。
   */
  matchNames?: string[];
  /**
   * Friendly name rendered in message. Defaults to `component`.
   */
  displayName?: string;
  /**
   * Optional library name, only used for message context.
   */
  library?: string;
  /** Attributes that must be present on the component. */
  attributes: Array<string | AttributeRequirement>;
}

export interface ComponentRuleGroup {
  /** UI library name, e.g. `element-plus`. */
  name: string;
  /** Component rules that belong to this library. */
  components: Array<Omit<ComponentAttributeRule, 'library'>>;
}

export interface RequireComponentAttributesRuleOptions {
  /** Plain component rules independent from libraries. */
  components?: ComponentAttributeRule[];
  /** Library-scoped rule groups for easier organization. */
  libraries?: ComponentRuleGroup[];
}
