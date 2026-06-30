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

export async function GET(
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
        { error: "생산계획을 찾을 수 없습니다." },
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

    return NextResponse.json({
      header,
      details,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      siteId,
      vendorName,
      planName,
      startDate,
      endDate,
      writer,
      details,
    } = body;

    await run("BEGIN TRANSACTION");

        await run(
      `
      UPDATE production_plan_headers
      SET
        site_id = ?,
        plan_start_date = ?,
        plan_end_date = ?,
        vendor_name = ?,
        plan_name = ?,
        start_date = ?,
        end_date = ?,
        writer = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        siteId,
        startDate,
        endDate,
        vendorName || "",
        planName,
        startDate,
        endDate,
        writer || "",
        id,
      ]
    );
    
    await run(
      `
      DELETE FROM production_plan_details
      WHERE header_id = ?
      `,
      [id]
    );

    for (let i = 0; i < details.length; i++) {
      const row = details[i];

      const mon = Number(row.monQty || 0);
      const tue = Number(row.tueQty || 0);
      const wed = Number(row.wedQty || 0);
      const thu = Number(row.thuQty || 0);
      const fri = Number(row.friQty || 0);
      const sat = Number(row.satQty || 0);
      const sun = Number(row.sunQty || 0);
      const total = mon + tue + wed + thu + fri + sat + sun;

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
          id,
          startDate,
          row.lineId || null,
          row.lineName || "",
          row.itemId || null,
          row.itemNo || "",
          row.itemName || "",
          row.customerName || "",
          mon,
          tue,
          wed,
          thu,
          fri,
          sat,
          sun,
          total,
          row.memo || "",
          i + 1,
        ]
      );
     
    }

    await run("COMMIT");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await run("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await run("BEGIN TRANSACTION");

    await run(
      `
      DELETE FROM production_plan_details
      WHERE header_id = ?
      `,
      [id]
    );

    await run(
      `
      DELETE FROM production_plan_headers
      WHERE id = ?
      `,
      [id]
    );

    await run("COMMIT");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await run("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}