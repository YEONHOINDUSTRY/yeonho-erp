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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");

    let sql = `
      SELECT *
      FROM production_plan_headers
    `;
    const params: any[] = [];

    if (siteId) {
      sql += ` WHERE site_id = ? `;
      params.push(siteId);
    }

    sql += ` ORDER BY start_date DESC, id DESC `;

    const rows = await all(sql, params);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    if (!siteId || !planName || !startDate || !endDate) {
      return NextResponse.json(
        { error: "사업장, 생산계획명, 시작일, 종료일은 필수입니다." },
        { status: 400 }
      );
    }

    if (!Array.isArray(details) || details.length === 0) {
      return NextResponse.json(
        { error: "생산계획 상세 행이 없습니다." },
        { status: 400 }
      );
    }

    await run("BEGIN TRANSACTION");

        const headerResult = await run(
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
        siteId,
        startDate,
        endDate,
        vendorName || "",
        planName,
        startDate,
        endDate,
        writer || "",
      ]
    );
   

    const headerId = headerResult.lastID;

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
          headerId,
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

    return NextResponse.json({
      success: true,
      id: headerId,
    });
  } catch (err: any) {
    await run("ROLLBACK").catch(() => {});
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}