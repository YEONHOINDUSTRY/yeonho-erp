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

function get(sql: string, params: any[] = []) {
  return new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const header = await get(
      `
      SELECT *
      FROM production_plan_headers
      WHERE id = ?
      `,
      [id]
    );

    if (!header) {
      return NextResponse.json(
        { error: "복사할 생산계획을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const details = await all(
      `
      SELECT *
      FROM production_plan_details
      WHERE header_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [id]
    );

    await run("BEGIN TRANSACTION");

        const newHeader = await run(
      `
      INSERT INTO production_plan_headers (
        site_id,
        plan_start_date,
        plan_end_date,
        vendor_name,
        plan_name,
        start_date,
        end_date,
        writer,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        header.site_id,
        header.plan_start_date || header.start_date,
        header.plan_end_date || header.end_date,
        header.vendor_name || "",
        `${header.plan_name} - 복사본`,
        header.start_date || header.plan_start_date,
        header.end_date || header.plan_end_date,
        header.writer || "",
      ]
    );
   
    const newHeaderId = newHeader.lastID;

    for (const row of details) {
            await run(
        `
        INSERT INTO production_plan_details (
          header_id,
          plan_date,
          line_id,
          line_name,
          item_id,
          item_no,
          item_name,
          customer_name,
          mon_qty,
          tue_qty,
          wed_qty,
          thu_qty,
          fri_qty,
          sat_qty,
          sun_qty,
          total_qty,
          memo,
          sort_order
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          newHeaderId,
          row.plan_date || header.plan_start_date || header.start_date,
          row.line_id,
          row.line_name,
          row.item_id,
          row.item_no,
          row.item_name,
          row.customer_name,
          row.mon_qty,
          row.tue_qty,
          row.wed_qty,
          row.thu_qty,
          row.fri_qty,
          row.sat_qty,
          row.sun_qty,
          row.total_qty,
          row.memo,
          row.sort_order,
        ]
      );
       
    }

    await run("COMMIT");

    return NextResponse.json({
      success: true,
      id: newHeaderId,
    });
  } catch (err: any) {
    await run("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}