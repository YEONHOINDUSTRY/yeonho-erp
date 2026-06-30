import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function run(sql: string, params: any[] = []) {
  return new Promise<any>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql: string, params: any[] = []) {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function ensureTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      customer_name TEXT,
      manager TEXT,
      phone TEXT,
      memo TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = [
    "customer_name TEXT",
    "manager TEXT",
    "phone TEXT",
    "memo TEXT",
    "created_at TEXT DEFAULT CURRENT_TIMESTAMP",
  ];

  for (const col of columns) {
    await run(`ALTER TABLE sites ADD COLUMN ${col}`).catch(() => {});
  }
}

export async function GET() {
  try {
    await ensureTable();

    const rows = await all(`
      SELECT
        id,
        name,
        customer_name,
        manager,
        phone,
        memo,
        created_at
      FROM sites
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { name, customerName, manager, phone, memo } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "사업장명은 필수입니다." },
        { status: 400 }
      );
    }

    const result = await run(
      `
     INSERT INTO sites (
        name,
        site_name,
        customer_name,
        manager,
        phone,
        memo,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        String(name).trim(),
        String(name).trim(),
        customerName || "",
        manager || "",
        phone || "",
        memo || "",
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.lastID,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}