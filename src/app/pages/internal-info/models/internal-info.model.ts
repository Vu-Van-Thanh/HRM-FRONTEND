export interface InternalInfo {
  id: number;
  title: string;
  content: string;
  departmentId: string | number;
  departmentName: string;
  createdBy: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  documentId?: string;
  type?: string;
} 