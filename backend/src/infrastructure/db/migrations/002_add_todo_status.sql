-- Add kanban column status to todos.
-- 'todo' | 'in_progress' | 'done'  (kept in sync with completed column)
ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'todo';
UPDATE todos SET status = 'done' WHERE completed = 1;
