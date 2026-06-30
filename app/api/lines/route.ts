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
    CREATE TABLE IF NOT EXISTS lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER DEFAULT 0,
      line_name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = [
    "site_id INTEGER DEFAULT 0",
    "line_name TEXT",
    "description TEXT",
    "is_active INTEGER DEFAULT 1",
    "created_at TEXT DEFAULT CURRENT_TIMESTAMP",
  ];

  for (const col of columns) {
    await run(`ALTER TABLE lines ADD COLUMN ${col}`).catch(() => {});
  }
}

export async function GET(request: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");

    let sql = `
      SELECT
        id,
        site_id,
        line_name,
        description,
        is_active,
        created_at
      FROM lines
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE site_id = ? `;
      params.push(siteId);
    }

    sql += ` ORDER BY id DESC `;

    const rows = await all(sql, params);

    return NextResponse.json(
      rows.map((row: any) => ({
        id: row.id,
        site_id: row.site_id,
        name: row.line_name,
        line_name: row.line_name,
        description: row.description,
        is_active: row.is_active,
        created_at: row.created_at,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { siteId, lineName, description, isActive } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: "사업장을 선택하세요." },
        { status: 400 }
      );
    }

    if (!lineName || !String(lineName).trim()) {
      return NextResponse.json(
        { error: "라인명은 필수입니다." },
        { status: 400 }
      );
    }

    const result = await run(
      `
      INSERT INTO lines (
        site_id,
        line_name,
        description,
        is_active,
        created_at
      )
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        siteId,
        String(lineName).trim(),
        description || "",
        isActive ? 1 : 0,
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