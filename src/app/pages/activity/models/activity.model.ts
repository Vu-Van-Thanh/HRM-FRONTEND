export interface Activity {
  id: number;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  activityType: ActivityType;
  registrationType?: 'leave' | 'remote';
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  leaveType?: string;
  remoteType?: string;
  reason: string;
  status: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ActivityType {
  ATTENDANCE = 'ATTENDANCE',      // Chấm công
  REGISTRATION = 'REGISTRATION',  // Đăng ký hoạt động (nghỉ phép, làm việc từ xa)
  OVERTIME = 'OVERTIME',         // Tăng ca
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
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
} 