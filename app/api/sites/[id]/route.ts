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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { name, customerName, manager, phone, memo } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "사업장명은 필수입니다." },
        { status: 400 }
      );
    }

    await run(
      `
      UPDATE sites
      SET
        name = ?,
        site_name = ?,
        customer_name = ?,
        manager = ?,
        phone = ?,
        memo = ?
      WHERE id = ?
      `,
      [
        String(name).trim(),
        String(name).trim(),
        customerName || "",
        manager || "",
        phone || "",
        memo || "",
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await run(
      `
      DELETE FROM sites
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}