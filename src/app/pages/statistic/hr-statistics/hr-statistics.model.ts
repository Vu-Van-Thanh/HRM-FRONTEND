import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ApexResponsive } from "ng-apexcharts";

export interface ChartType {
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart?: ApexChart;
    dataLabels?: ApexDataLabels;
    plotOptions?: ApexPlotOptions;
    yaxis?: ApexYAxis;
    xaxis?: ApexXAxis;
    fill?: ApexFill;
    tooltip?: ApexTooltip;
    stroke?: ApexStroke;
    legend?: ApexLegend;
    grid?: ApexGrid;
    markers?: ApexMarkers;
    colors?: string[];
    labels?: string[];
    responsive?: ApexResponsive[];
} 

// data growthworkforce
export interface GrowthWorkforce {
    employeeGrowthByMonth : number[];
    newEmployeesByMonth : number[];
    leaveEmployeesByMonth : number[];
    retentionRate : number[];
    GrowthRate : number[];
}
export interface EmployeeByGender {
    male : number;
    female : number
}
export interface EmployeeByDepartment {
    departmentName : string;
    employeeCount : number;
}
export interface EmployeeByDepartmentAndGender {
    departmentName : string;
    male : number;
    female : number;
}

export interface EmployeeByDegree {
    degreeName : string;    
    employeeCount : number;
}
export interface EmployeeByRegion{
    regionName : string;
    employeeCount : number;
}
export interface SeniorityEmployee{
    type : string;
    count : number;
}
export interface EmployeeInDepartment {
    departmentID: string[];
    employeeIDList: string[];
}
export interface EmployeeSkills
{
    criterionID : string;
    name : string;
    category : string;
    averageScore : number;
    totalEvaluations : number;
    weight : number;
}
export interface DepartmentPerformance {
    departmentName : string;
    performanceScore : number[];
}
export interface EmployeeCounter {
    employeeDepartment : EmployeeByDepartment[];
    employeeGender : EmployeeByGender;
    employeeByDepartmentAndGender : EmployeeByDepartmentAndGender[];
    employeeByDegree : EmployeeByDegree[];
    employeeByRegion : EmployeeByRegion[];
    seniorityEmployees : SeniorityEmployee[];
}