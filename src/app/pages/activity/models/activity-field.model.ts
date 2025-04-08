export interface ActivityField {
  id: number;
  activityType: string; // 'attendance', 'leave', 'remote'
  fieldName: string;
  fieldLabel: string;
  fieldType: string; // 'text', 'number', 'date', 'time', 'datetime', 'select', 'checkbox', 'radio'
  isRequired: boolean;
  options?: string[]; // For select, radio type fields
  defaultValue?: any;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 