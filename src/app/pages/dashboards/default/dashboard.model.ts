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

export interface ProjectTaskInfo {
    taskId: string;
    title: string;
    description: string;
    startDate: Date;
    deadline: Date;
    completedAt: Date | null;
    status: string;
    priority: string;
    projectId: string;
    projectName: string;
    assignedTo: string;
    assignedToName: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}