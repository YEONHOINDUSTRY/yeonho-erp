import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "yeonho.db");

export const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 거래처
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

  // 품목
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

  // 생산실적
  db.run(`
    CREATE TABLE IF NOT EXISTS productions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_date TEXT NOT NULL,
      line_name TEXT,
      item_no TEXT,
      item_name TEXT,
      customer_name TEXT,
      unit_price INTEGER DEFAULT 0,
      amount INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 0,
      worker TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 정산
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

  // 사업장
  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_name TEXT NOT NULL,
      customer_name TEXT,
      manager TEXT,
      phone TEXT,
      memo TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 직원
  db.run(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      worker_name TEXT NOT NULL,
      nationality TEXT,
      position TEXT,
      phone TEXT,
      hire_date TEXT,
      resign_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 생산라인
  db.run(`
    CREATE TABLE IF NOT EXISTS lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      line_name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 휴게시간
  db.run(`
    CREATE TABLE IF NOT EXISTS break_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      break_name TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_deductible INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 비가동 사유
  db.run(`
    CREATE TABLE IF NOT EXISTS downtime_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      type_name TEXT NOT NULL,
      memo TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 비가동
  db.run(`
    CREATE TABLE IF NOT EXISTS downtimes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      work_date TEXT NOT NULL,
      line_name TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      total_minutes INTEGER DEFAULT 0,
      break_minutes INTEGER DEFAULT 0,
      payable_minutes INTEGER DEFAULT 0,
      downtime_type TEXT,
      reason TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 생산계획
  db.run(`
    CREATE TABLE IF NOT EXISTS production_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      plan_date TEXT NOT NULL,
      line_id INTEGER,
      line_name TEXT,
      item_id INTEGER,
      item_no TEXT,
      item_name TEXT,
      customer_name TEXT,
      plan_qty INTEGER DEFAULT 0,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // 생산계획 헤더
  db.run(`
    CREATE TABLE IF NOT EXISTS production_plan_headers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      plan_title TEXT,
      display_company_name TEXT,
      plan_start_date TEXT NOT NULL,
      plan_end_date TEXT NOT NULL,
      writer_name TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 생산계획 상세
  db.run(`
    CREATE TABLE IF NOT EXISTS production_plan_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      header_id INTEGER,
      site_id INTEGER,
      plan_date TEXT NOT NULL,
      line_id INTEGER,
      line_name TEXT,
      item_id INTEGER,
      item_no TEXT,
      item_name TEXT,
      customer_name TEXT,
      plan_qty INTEGER DEFAULT 0,
      memo TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

db.serialize(() => {
  db.run("ALTER TABLE items ADD COLUMN site_id INTEGER", () => {});
  db.run("ALTER TABLE items ADD COLUMN car_model TEXT", () => {});
  db.run("ALTER TABLE items ADD COLUMN material TEXT", () => {});
  db.run("ALTER TABLE items ADD COLUMN thickness TEXT", () => {});
  db.run("ALTER TABLE items ADD COLUMN process_name TEXT", () => {});
  db.run("ALTER TABLE items ADD COLUMN unit_name TEXT DEFAULT 'EA'", () => {});
  db.run("ALTER TABLE items ADD COLUMN memo TEXT", () => {});

  db.run("ALTER TABLE break_times ADD COLUMN is_active INTEGER DEFAULT 1", () => {});
});