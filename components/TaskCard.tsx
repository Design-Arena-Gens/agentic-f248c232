import { useMemo } from "react";
import styles from "./TaskCard.module.css";
import type { ColumnKey, Task } from "./types";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: ColumnKey) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  accent: string;
}

const priorityCopy: Record<Task["priority"], string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority"
};

export default function TaskCard({
  task,
  onStatusChange,
  onDelete,
  onDragStart,
  onDragEnd,
  accent
}: TaskCardProps) {
  const formattedCreatedAt = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric"
    }).format(new Date(task.createdAt));
  }, [task.createdAt]);

  const formattedDueDate = useMemo(() => {
    if (!task.dueDate) return null;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric"
    }).format(new Date(task.dueDate));
  }, [task.dueDate]);

  return (
    <article
      className={styles.card}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
    >
      <div className={styles.header}>
        <span className={styles.priority} data-priority={task.priority}>
          {priorityCopy[task.priority]}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className={styles.delete}
          type="button"
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
      <h3 className={styles.title}>{task.title}</h3>
      {task.description && <p className={styles.description}>{task.description}</p>}
      <div className={styles.meta}>
        <span className={styles.metaItem}>Created · {formattedCreatedAt}</span>
        {formattedDueDate && <span className={styles.metaItem}>Due · {formattedDueDate}</span>}
      </div>
      {task.tags.length > 0 && (
        <div className={styles.tags}>
          {task.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <select
        className={styles.status}
        value={task.status}
        onChange={(event) => onStatusChange(task.id, event.target.value as ColumnKey)}
        style={{ borderColor: accent }}
      >
        <option value="backlog">Backlog</option>
        <option value="inProgress">In Progress</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>
    </article>
  );
}
