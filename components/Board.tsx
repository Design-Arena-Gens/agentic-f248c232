import { useCallback, useMemo, useState, DragEvent } from "react";
import Column from "./Column";
import NewTaskForm from "./NewTaskForm";
import styles from "./Board.module.css";
import usePersistentTasks from "./usePersistentTasks";
import type { ColumnDefinition, ColumnKey, Task } from "./types";

const columns: ColumnDefinition[] = [
  { id: "backlog", title: "Backlog", accent: "#f97316" },
  { id: "inProgress", title: "In Progress", accent: "#3b82f6" },
  { id: "review", title: "Review", accent: "#a855f7" },
  { id: "done", title: "Done", accent: "#22c55e" }
];

function createDefaultTasks(): Task[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Plan sprint goals",
      description: "Outline key deliverables with the product team.",
      status: "backlog",
      priority: "medium",
      createdAt: new Date().toISOString(),
      tags: ["product", "sprint"]
    },
    {
      id: crypto.randomUUID(),
      title: "Set up analytics dashboard",
      description: "Integrate new funnel report into the dashboard.",
      status: "inProgress",
      priority: "high",
      createdAt: new Date().toISOString(),
      tags: ["analytics"]
    },
    {
      id: crypto.randomUUID(),
      title: "QA regression suite",
      description: "Run regression tests before release freeze.",
      status: "review",
      priority: "medium",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      tags: ["qa", "release"]
    },
    {
      id: crypto.randomUUID(),
      title: "Publish changelog",
      description: "Write and publish changelog blog post.",
      status: "done",
      priority: "low",
      createdAt: new Date().toISOString(),
      tags: ["marketing"]
    }
  ];
}

function useInitialTasks() {
  const defaultTasks = useMemo(() => createDefaultTasks(), []);
  return defaultTasks;
}

export default function Board() {
  const defaultTasks = useInitialTasks();
  const { tasks, setTasks, updateTasks } = usePersistentTasks(defaultTasks);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Task["priority"]>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => task.tags.forEach((tag) => tagSet.add(tag)));
    return ["all", ...Array.from(tagSet)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      if (selectedTag !== "all" && !task.tags.includes(selectedTag)) {
        return false;
      }
      if (!search.trim()) {
        return true;
      }
      const query = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [tasks, priorityFilter, selectedTag, search]);

  const handleCreateTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [setTasks]
  );

  const handleUpdateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      updateTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
    },
    [updateTasks]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      updateTasks((current) => current.filter((task) => task.id !== id));
    },
    [updateTasks]
  );

  const handleDragStart = useCallback((id: string) => {
    setDraggedTaskId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, column: ColumnKey) => {
      event.preventDefault();
      const taskId = draggedTaskId ?? event.dataTransfer.getData("text/plain");
      if (!taskId) return;
      handleUpdateTask(taskId, { status: column });
      setDraggedTaskId(null);
    },
    [draggedTaskId, handleUpdateTask]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const byColumn = columns.map((column) => ({
      id: column.id,
      title: column.title,
      count: tasks.filter((task) => task.status === column.id).length
    }));
    const completion =
      total === 0 ? 0 : Math.round((byColumn.find((item) => item.id === "done")?.count ?? 0) / total * 100);
    return { total, byColumn, completion };
  }, [tasks]);

  return (
    <main className={styles.wrapper}>
      <section className={styles.toolbar}>
        <div>
          <h1>Kanban Flow</h1>
          <p>Track work with delightful flow state.</p>
        </div>
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className={styles.select}
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}
          >
            <option value="all">All priorities</option>
            <option value="high">High only</option>
            <option value="medium">Medium only</option>
            <option value="low">Low only</option>
          </select>
          <select
            className={styles.select}
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
          >
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag === "all" ? "All tags" : `Tag: ${tag}`}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className={styles.summary}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Total</span>
          <span className={styles.metricValue}>{stats.total}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Completion</span>
          <span className={styles.metricValue}>{stats.completion}%</span>
        </div>
        {stats.byColumn.map((entry) => (
          <div key={entry.id} className={styles.metric}>
            <span className={styles.metricLabel}>{entry.title}</span>
            <span className={styles.metricValue}>{entry.count}</span>
          </div>
        ))}
      </section>

      <NewTaskForm onSubmit={handleCreateTask} />

      <section className={styles.columns}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={styles.columnWrapper}
            onDrop={(event) => handleDrop(event, column.id)}
            onDragOver={handleDragOver}
          >
            <Column
              definition={column}
              tasks={filteredTasks.filter((task) => task.status === column.id)}
              onStatusChange={(taskId, status) => handleUpdateTask(taskId, { status })}
              onDelete={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        ))}
      </section>
    </main>
  );
}
