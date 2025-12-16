import { useMemo } from "react";
import TaskCard from "./TaskCard";
import type { ColumnDefinition, ColumnKey, Task } from "./types";
import styles from "./Column.module.css";

interface ColumnProps {
  definition: ColumnDefinition;
  tasks: Task[];
  onStatusChange: (taskId: string, status: ColumnKey) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

export default function Column({
  definition,
  tasks,
  onStatusChange,
  onDelete,
  onDragStart,
  onDragEnd
}: ColumnProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  return (
    <div className={styles.column}>
      <header className={styles.header} style={{ borderColor: definition.accent }}>
        <span className={styles.dot} style={{ backgroundColor: definition.accent }} />
        <h2>{definition.title}</h2>
        <span className={styles.count}>{sortedTasks.length}</span>
      </header>
      <div className={styles.stack}>
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            accent={definition.accent}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
