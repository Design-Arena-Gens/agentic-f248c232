export type ColumnKey = "backlog" | "inProgress" | "review" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: ColumnKey;
  priority: "low" | "medium" | "high";
  assignee?: string;
  createdAt: string;
  dueDate?: string;
  tags: string[];
}

export type ColumnDefinition = {
  id: ColumnKey;
  title: string;
  accent: string;
};
