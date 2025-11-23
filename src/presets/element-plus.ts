import type { UiRules } from '../types';

export const ElementPlusPreset: UiRules = {
  ElInput: {
    defaults: {
      clearable: true
    },
    autoPlaceholder: (label) => `请输入${label}`
  },
  ElSelect: {
    defaults: {
      clearable: true,
      filterable: true
    },
    autoPlaceholder: (label) => `请选择${label}`
  },
  ElButton: {
    defaults: {
      type: 'warning',
      loading: true
    }
  },
  ElDatePicker: {
    defaults: {
      clearable: true,
      valueFormat: 'YYYY-MM-DD'
    },
    autoPlaceholder: (label) => `请选择${label}`
  },
  ElTimePicker: {
    defaults: {
      clearable: true
    },
    autoPlaceholder: (label) => `请选择${label}`
  }
};
