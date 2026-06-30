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

    await run(
      `
      UPDATE lines
      SET
        site_id = ?,
        line_name = ?,
        description = ?,
        is_active = ?
      WHERE id = ?
      `,
      [
        siteId,
        String(lineName).trim(),
        description || "",
        isActive ? 1 : 0,
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
      DELETE FROM lines
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}