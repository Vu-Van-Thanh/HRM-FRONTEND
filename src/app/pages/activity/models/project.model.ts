export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  managerId?: number;
  managerName?: string;
  departmentId?: number;
  departmentName?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 