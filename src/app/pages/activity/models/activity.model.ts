export interface Activity {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  type: ActivityType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: ActivityStatus;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ActivityType {
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