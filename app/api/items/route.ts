import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT
        items.id,
        items.site_id,
        sites.name AS site_name,
        items.customer_name,
        items.item_no,
        items.item_name,
        items.model_name,
        items.material,
        items.spec,
        items.process_name,
        items.unit,
        items.cycle_time,
        items.unit_price,
        items.is_active,
        items.created_at
      FROM items
      LEFT JOIN sites ON sites.id = items.site_id
      ORDER BY items.id DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          resolve(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
          return;
        }

        resolve(NextResponse.json(rows));
      }
    );
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    site_id,
    customer_name,
    item_no,
    item_name,
    model_name,
    material,
    spec,
    process_name,
    unit,
    cycle_time,
    unit_price,
    is_active,
  } = body;

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO items (
        site_id,
        customer_name,
        item_no,
        item_name,
        model_name,
        material,
        spec,
        process_name,
        unit,
        cycle_time,
        unit_price,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        site_id,
        customer_name,
        item_no,
        item_name,
        model_name,
        material,
        spec,
        process_name,
        unit,
        cycle_time,
        unit_price,
        is_active,
      ],
      function (err) {
        if (err) {
          resolve(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
          return;
        }

        resolve(
          NextResponse.json({
            id: this.lastID,
            message: "품목이 등록되었습니다.",
          })
        );
      }
    );
  });
}