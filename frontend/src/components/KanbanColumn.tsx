import { useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Todo } from '../types/models.js';

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
    </svg>
  );
}

interface CardProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

function KanbanCard({ todo, onToggle, onUpdate, onRemove }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  function saveEdit() {
    const t = editTitle.trim();
    if (t && t !== todo.title) onUpdate(todo.id, t);
    setEditing(false);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') { setEditTitle(todo.title); setEditing(false); }
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4 shadow-sm transition dark:border-white/10" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo)}
          aria-label={`Advance "${todo.title}"`}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 ${
            todo.completed
              ? 'border-red-600 bg-red-600'
              : 'border-gray-300 hover:border-red-400'
          }`}
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={onKey}
              onBlur={saveEdit}
              aria-label="Edit task title"
              className="w-full rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            style={{ backgroundColor: 'var(--input-bg)' }}
            />
          ) : (
            <Link
              to={`/todos/${todo.id}`}
              className={`block text-sm font-medium leading-snug focus:outline-none focus:ring-2 focus:ring-red-500 rounded ${
                todo.completed
                  ? 'text-gray-400 line-through'
                  : 'text-gray-800 hover:text-red-600 dark:text-gray-100 dark:hover:text-red-400'
              }`}
            >
              {todo.title}
            </Link>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            {new Date(todo.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => { setEditTitle(todo.title); setEditing(true); }}
              aria-label="Edit"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onRemove(todo.id)}
              aria-label={`Delete ${todo.title}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  dot: string;
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onUpdate: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

export function KanbanColumn({ title, dot, todos, onToggle, onUpdate, onRemove }: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--column-bg)' }}>
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="font-semibold text-gray-800 dark:text-white">{title}</h2>
        <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--count-bg)', color: 'var(--count-color)' }}>
          {todos.length}
        </span>
      </div>
      <div className="flex-1 space-y-2.5 p-3">
        {todos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-blue-200">No tasks</p>
        ) : (
          todos.map((t) => (
            <KanbanCard key={t.id} todo={t} onToggle={onToggle} onUpdate={onUpdate} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
}
