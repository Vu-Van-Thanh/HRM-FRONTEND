export interface WorkHistory {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Relative {
  name: string;
  relationship: string;
  dateOfBirth: string;
  phone: string;
  address: string;
}

export interface Contract {
  contractNo: string;
  type: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  status: string;
}

export interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  status: boolean;
  photo: string;
  createdAt: Date;
  updatedAt: Date;
  // Thông tin chi tiết
  idCard: string;
  idCardIssueDate: string;
  idCardIssuePlace: string;
  taxCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;
  education: string;
  major: string;
  school: string;
  graduationYear: string;
  joinDate: string;
  contractType: string;
  salary: number;
  bankAccount: string;
  bankName: string;
  bankBranch: string;
  insuranceNumber: string;
  healthInsuranceNumber: string;
  socialInsuranceNumber: string;
  workHistory: WorkHistory[];
  relatives: Relative[];
  contracts: Contract[];
} 