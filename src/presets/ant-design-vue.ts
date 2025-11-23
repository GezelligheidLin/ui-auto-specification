import type { UiRules } from '../types';

export const AntDesignVuePreset: UiRules = {
  AInput: {
    defaults: {
      allowClear: true
    },
    autoPlaceholder: (label) => `请输入${label}`
  },
  ASelect: {
    defaults: {
      allowClear: true,
      showSearch: true
    },
    autoPlaceholder: (label) => `请选择${label}`
  },
  ADatePicker: {
    defaults: {
      allowClear: true,
      valueFormat: 'YYYY-MM-DD'
    },
    autoPlaceholder: (label) => `请选择${label}`
  }
};
