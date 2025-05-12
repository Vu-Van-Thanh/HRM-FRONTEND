// Chart data
export interface ChartType {
    chart?: any;
    plotOptions?: any;
    colors?: any;
    series?: any;
    fill?: any;
    dataLabels?: any;
    legend?: any;
    xaxis?: any;
    stroke?: any;
    labels?: any;
}
export interface AttendaceFilterDTO
{
    StartDate : Date;
    EndDate : Date;
    Starttime : Date;
    Endtime : Date;
    ProjectId : string;
    Position : string;
    EmployeeIDList : string;
    Status : string;
}


export interface AttendaceResponseDTO
{
    AttendanceId : string;
    EmployeeId : string;
    AttendanceDate : Date;
    Starttime: Date;
    Endtime: Date;
    Status : string;
    Position : string;
    Description : string;
    ActivityId : string;
    ProjectId : string;
}