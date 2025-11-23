import type { UiRules } from '../types';

export const NaiveUiPreset: UiRules = {
  NInput: {
    defaults: {
      clearable: true
    },
    autoPlaceholder: (label) => `请输入${label}`
  },
  NSelect: {
    defaults: {
      clearable: true,
      filterable: true,
      consistentMenuWidth: false
    },
    autoPlaceholder: (label) => `请选择${label}`
  },
  NDatePicker: {
    defaults: {
      clearable: true,
      valueFormat: 'yyyy-MM-dd'
    },
    autoPlaceholder: (label) => `请选择${label}`
  }
};
