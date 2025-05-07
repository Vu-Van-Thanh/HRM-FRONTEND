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
  id?: number;
  employeeID?: string;
  managerID?: string;
  position?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  tax: string;
  address?: string;
  nationality?: string;
  ethnic?: string;
  religion?: string;
  placeOfBirth?: string;
  indentityCard?: string;
  placeIssued?: string;
  country?: string;
  province?: string;
  district?: string;
  commune?: string;
  insuranceNumber?: string;
  avatar?: string;
  identity?: string[];
  insurance?: string[];
  
  // Additional frontend properties
  email?: string;
  phone?: string;
  code?: string;
  status?: boolean;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  photo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Existing detailed info fields that might still be used in the frontend
  idCard?: string;
  idCardIssueDate?: string;
  idCardIssuePlace?: string;
  taxCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  relationship?: string;
  education?: string;
  major?: string;
  school?: string;
  graduationYear?: string;
  joinDate?: string;
  contractType?: string;
  salary?: number;
  bankAccount?: string;
  bankName?: string;
  bankBranch?: string;
  healthInsuranceNumber?: string;
  socialInsuranceNumber?: string;
  workHistory?: WorkHistory[];
  relatives?: Relative[];
  contracts?: Contract[];
} 