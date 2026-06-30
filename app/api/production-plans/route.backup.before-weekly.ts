import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const siteId = searchParams.get("site_id");
  const month = searchParams.get("month");

  let sql = `
    SELECT *
    FROM production_plans
    WHERE 1 = 1
  `;

  const params: any[] = [];

  if (siteId) {
    sql += " AND site_id = ?";
    params.push(siteId);
  }

  if (month) {
    sql += " AND plan_date LIKE ?";
    params.push(`${month}%`);
  }

  sql += " ORDER BY plan_date DESC, id DESC";

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
      INSERT INTO production_plans
      (
        site_id,
        plan_date,
        line_id,
        line_name,
        item_id,
        item_no,
        item_name,
        customer_name,
        plan_qty,
        memo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.site_id,
        body.plan_date,
        body.line_id,
        body.line_name,
        body.item_id,
        body.item_no,
        body.item_name,
        body.customer_name,
        body.plan_qty,
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