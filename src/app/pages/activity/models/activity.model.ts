export interface Activity {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  activityType: ActivityType;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  status: ActivityStatus;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ActivityType {
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',           // Nghỉ phép
  REMOTE = 'REMOTE',         // Làm việc từ xa
  OVERTIME = 'OVERTIME',     // Tăng ca
  BUSINESS_TRIP = 'BUSINESS_TRIP'  // Công tác
}

export enum ActivityStatus {
  PENDING = 'PENDING',       // Chờ phê duyệt
  APPROVED = 'APPROVED',     // Đã phê duyệt
  REJECTED = 'REJECTED'      // Từ chối
}

export interface ActivityField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required: boolean;
  options?: { value: any; label: string }[];
} 