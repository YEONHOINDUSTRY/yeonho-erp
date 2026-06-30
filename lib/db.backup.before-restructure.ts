import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "yeonho.db");

export const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manager TEXT,
      phone TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_no TEXT NOT NULL,
      item_name TEXT NOT NULL,
      customer_name TEXT,
      unit_price INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS productions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_date TEXT NOT NULL,
      line_name TEXT,
      item_no TEXT,
      item_name TEXT,
      quantity INTEGER DEFAULT 0,
      worker TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
db.serialize(() => {
  db.run("ALTER TABLE productions ADD COLUMN customer_name TEXT", () => {});
  db.run("ALTER TABLE productions ADD COLUMN unit_price INTEGER DEFAULT 0", () => {});
  db.run("ALTER TABLE productions ADD COLUMN amount INTEGER DEFAULT 0", () => {});
});
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      settlement_month TEXT NOT NULL,
      total_qty INTEGER DEFAULT 0,
      production_amount INTEGER DEFAULT 0,
      manager_stop_hours REAL DEFAULT 0,
      manager_stop_amount INTEGER DEFAULT 0,
      worker_stop_hours REAL DEFAULT 0,
      worker_stop_amount INTEGER DEFAULT 0,
      transport_cost INTEGER DEFAULT 0,
      final_amount INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});