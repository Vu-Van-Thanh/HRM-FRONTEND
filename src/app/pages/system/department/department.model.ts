export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  managerId: number;
  managerName: string;
  contact: string;
  parentId: number | null;
  parentName: string | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
} 