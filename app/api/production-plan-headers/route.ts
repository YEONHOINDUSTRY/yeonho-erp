import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("site_id");

  let sql = `
    SELECT *
    FROM production_plan_headers
    WHERE 1 = 1
  `;

  const params: any[] = [];

  if (siteId) {
    sql += " AND site_id = ?";
    params.push(siteId);
  }

  sql += " ORDER BY plan_start_date DESC, id DESC";

  return new Promise((resolve) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json(rows));
    });
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO production_plan_headers
      (
        site_id,
        plan_title,
        display_company_name,
        plan_start_date,
        plan_end_date,
        writer_name,
        memo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.site_id,
        body.plan_title,
        body.display_company_name,
        body.plan_start_date,
        body.plan_end_date,
        body.writer_name,
        body.memo,
      ],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(
          NextResponse.json({
            success: true,
            id: this.lastID,
          })
        );
      }
    );
  });
}