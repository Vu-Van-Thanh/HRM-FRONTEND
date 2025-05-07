export interface Activity {
  requestId: string;      // ID của request/hoạt động
  employeeId: string;     // ID của nhân viên
  employeeName?: string;  // Tên nhân viên (được set sau khi kết hợp với danh sách nhân viên)
  activityId: string;     // ID của loại hoạt động
  createdAt: string;      // Thời gian tạo
  startTime: string;      // Thời gian bắt đầu
  endTime: string;        // Thời gian kết thúc
  status: string;         // Trạng thái
  requestFlds: string;    // Thông tin bổ sung (dạng JSON string)
  
  // Trường bổ sung cho giao diện
  departmentName?: string; // Tên phòng ban (được set sau khi kết hợp với danh sách nhân viên)
  activityType?: string;   // Loại hoạt động (được set từ activityId)
  reason?: string;        // Lý do (được parse từ requestFlds)
  taskName?: string;      // Tên công việc (được parse từ requestFlds)
  estimatedHours?: number; // Số giờ ước tính (được parse từ requestFlds)
}

export interface ActivityType {
  activityId: string;
  activityDescription: string;
  activityType: string;
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