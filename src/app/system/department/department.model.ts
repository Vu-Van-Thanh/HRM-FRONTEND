export interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  managerId?: number;
  managerName?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
} 