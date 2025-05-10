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

export interface Project {
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  departmentId: string;
  departmentName: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

// Legacy interface for compatibility
export interface LegacyProject {
  id: any;
  image: string;
  text: string;
  subtext: string;
  users: string[];
  status: string;
  date: string;
  comment: number;
}
