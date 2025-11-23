import type { UiRules } from '../types';

export const VarletPreset: UiRules = {
  VarInput: {
    defaults: {
      clearable: true
    },
    autoPlaceholder: (label) => `请输入${label}`
  },
  VarSelect: {
    defaults: {
      clearable: true
    },
    autoPlaceholder: (label) => `请选择${label}`
  }
};
