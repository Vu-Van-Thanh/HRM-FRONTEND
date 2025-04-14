export interface Position {
  id: number;
  name: string;
  description?: string;
  departmentId?: number;
  departmentName?: string;
  level?: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
} 