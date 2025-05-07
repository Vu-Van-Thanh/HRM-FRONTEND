export interface EmployeeDepartmentDTO
{
    employeeID?: string;
    departmentID?: string;
    employeeName?: string;
    departmentName?: string;
}


export interface SalaryInfo {
    employeeId: string;
    salaryBase: SalaryBaseDTO;
    adjustments: AdjustmentResult[];
  }
  
  export interface SalaryBaseDTO {
    salaryId?: string;
    baseIndex?: number;
    baseSalary?: number;
    effectiveDate?: Date;
    createdAt?: Date;
  }
  
  export interface AdjustmentResult {
    adjustmentId: string;
    baseId: string;
    adjustType: string;
    adjustmentName: string;
    amount?: number;
    percentage?: number;
    resultPercentage?: number;
    resultAmount?: number;
    result?: number;
  }
  