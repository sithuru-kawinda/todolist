CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS todos (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        TEXT PRIMARY KEY,
  expires_at DATETIME NOT NULL
);

CREATE TRIGGER IF NOT EXISTS todos_updated_at
AFTER UPDATE ON todos
BEGIN
  UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
