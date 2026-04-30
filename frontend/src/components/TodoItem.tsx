import { useState, type KeyboardEvent } from 'react';
import type { Todo } from '../types/models.js';

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
    </svg>
  );
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onUpdate, onRemove }: TodoItemProps) {
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
    <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 dark:bg-zinc-900 sm:px-5">
      <button
        onClick={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'active' : 'complete'}`}
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 ${
          todo.completed
            ? 'border-red-600 bg-red-600'
            : 'border-gray-300 hover:border-gray-400 dark:border-zinc-600 dark:hover:border-zinc-400'
        }`}
      />

      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={onKey}
          onBlur={saveEdit}
          aria-label="Edit task title"
          className="min-w-0 flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-900 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      ) : (
        <span className={`min-w-0 flex-1 truncate text-sm ${todo.completed ? 'text-gray-400 line-through dark:text-zinc-500' : 'text-gray-900 dark:text-white'}`}>
          {todo.title}
        </span>
      )}

      {!editing && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            onClick={() => { setEditTitle(todo.title); setEditing(true); }}
            className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 transition hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm"
          >
            <span className="text-red-600"><EditIcon /></span>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onRemove(todo.id)}
            aria-label={`Delete ${todo.title}`}
            className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs text-gray-500 transition hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm"
          >
            <span className="text-red-600"><TrashIcon /></span>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
