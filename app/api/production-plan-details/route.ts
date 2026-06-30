import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const headerId = searchParams.get("header_id");

  if (!headerId) {
    return NextResponse.json({ error: "header_id가 필요합니다." }, { status: 400 });
  }

  return new Promise((resolve) => {
    db.all(
      `
      SELECT *
      FROM production_plan_details
      WHERE header_id = ?
      ORDER BY sort_order ASC, plan_date ASC, id ASC
      `,
      [headerId],
      (err, rows) => {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json(rows));
      }
    );
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO production_plan_details
      (
        header_id,
        site_id,
        plan_date,
        line_id,
        line_name,
        item_id,
        item_no,
        item_name,
        customer_name,
        plan_qty,
        memo,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        body.header_id,
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
        body.sort_order,
      ],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json({ success: true, id: this.lastID }));
      }
    );
  });
}