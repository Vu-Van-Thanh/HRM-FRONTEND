export interface ActivityRecord {
  id: number;
  userId: number;
  userName: string;
  departmentId: number;
  departmentName: string;
  activityType: string; // 'attendance', 'leave', 'remote'
  status: string; // 'pending', 'approved', 'rejected'
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: number;
  processedByName?: string;
  formData: Record<string, any>; // Dynamic form data based on activity fields
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 