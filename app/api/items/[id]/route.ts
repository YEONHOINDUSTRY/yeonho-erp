import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
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
      UPDATE items
      SET
        site_id = ?,
        customer_name = ?,
        item_no = ?,
        item_name = ?,
        model_name = ?,
        material = ?,
        spec = ?,
        process_name = ?,
        unit = ?,
        cycle_time = ?,
        unit_price = ?,
        is_active = ?
      WHERE id = ?
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
        id,
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
            message: "품목이 수정되었습니다.",
          })
        );
      }
    );
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;

  return new Promise((resolve) => {
    db.run(
      `
      DELETE FROM items
      WHERE id = ?
      `,
      [id],
      function (err) {
        if (err) {
          resolve(
            NextResponse.json({ error: err.message }, { status: 500 })
          );
          return;
        }

        resolve(
          NextResponse.json({
            message: "품목이 삭제되었습니다.",
          })
        );
      }
    );
  });
}