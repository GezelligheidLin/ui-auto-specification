import type { UiRules } from '../types';

export const VantPreset: UiRules = {
  VanField: {
    defaults: {
      clearable: true,
      inputAlign: 'right'
    },
    autoPlaceholder: (label) => `请输入${label}`
  },
  VanForm: {
    defaults: {
      colon: true
    }
  },
  VanButton: {
    defaults: {
      round: true,
      type: 'danger'
    }
  }
};
