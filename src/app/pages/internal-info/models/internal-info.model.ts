export interface InternalInfo {
  id: number;
  title: string;
  content: string;
  departmentId: number;
  departmentName: string;
  createdBy: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  documentId?: string; // ID of the Word document in the backend
} 