import { useCallback, useEffect, useState } from "react";
import { Task } from "./types";

const STORAGE_KEY = "kanban-tasks";

function parseTasks(value: string | null): Task[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Task[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export default function usePersistentTasks(initial: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") {
      return initial;
    }
    return parseTasks(window.localStorage.getItem(STORAGE_KEY)) ?? initial;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const updateTasks = useCallback((updater: (current: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  return { tasks, setTasks, updateTasks };
}
