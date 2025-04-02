export interface Attendance {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Đã duyệt' | 'Chờ duyệt';
  notes?: string;
} 