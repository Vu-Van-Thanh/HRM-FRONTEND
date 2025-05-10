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

export interface Task {
    taskId: string;
    title: string;
    description: string;
    startDate: string;
    deadline: string;
    completedAt: string | null;
    status: string;
    priority: string;
    projectId: string;
    projectName: string;
    assignedTo: string;
    assignedToName: string | null;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

// Legacy model for compatibility
export interface Tasklist {
    index?: number;
    id?: any;
    status?: string;
    name?: string;
    taskType?: string;
    images?: string[];
    checked?: boolean;
}
