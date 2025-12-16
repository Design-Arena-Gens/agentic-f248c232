import { FormEvent, useState } from "react";
import styles from "./NewTaskForm.module.css";
import type { Task } from "./types";

interface NewTaskFormProps {
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void;
}

const defaultForm: Omit<Task, "id" | "createdAt"> = {
  title: "",
  description: "",
  status: "backlog",
  priority: "medium",
  assignee: "",
  dueDate: "",
  tags: []
};

export default function NewTaskForm({ onSubmit }: NewTaskFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState("");
  const [expanded, setExpanded] = useState(true);

  function reset() {
    setForm(defaultForm);
    setTagInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description?.trim(),
      assignee: form.assignee?.trim() || undefined,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      tags: form.tags.map((tag) => tag.toLowerCase())
    });
    reset();
  }

  function addTag() {
    const value = tagInput.trim().toLowerCase();
    if (!value || form.tags.includes(value)) return;
    setForm((current) => ({ ...current, tags: [...current.tags, value] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag)
    }));
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2>Create Task</h2>
          <p>Capture work items with tags, priority, and due date.</p>
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </header>
      {expanded && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Title</span>
              <input
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span>Assignee</span>
              <input
                type="text"
                value={form.assignee}
                onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))}
                placeholder="Optional"
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as typeof form.status
                  }))
                }
              >
                <option value="backlog">Backlog</option>
                <option value="inProgress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as typeof form.priority
                  }))
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </label>
          </div>
          <div className={styles.tags}>
            <label className={styles.field}>
              <span>Tags</span>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  maxLength={18}
                  placeholder="Add and press enter"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button type="button" onClick={addTag}>
                  Add
                </button>
              </div>
            </label>
            <div className={styles.tagList}>
              {form.tags.map((tag) => (
                <button key={tag} type="button" onClick={() => removeTag(tag)} className={styles.tag}>
                  #{tag} ×
                </button>
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.submit}>
              Create Task
            </button>
            <button className={styles.reset} type="button" onClick={reset}>
              Clear
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
