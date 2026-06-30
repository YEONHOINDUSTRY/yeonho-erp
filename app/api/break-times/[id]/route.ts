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
    break_name,
    work_type,
    start_time,
    end_time,
    break_minutes,
    is_paid,
    is_active,
    memo,
  } = body;

  return new Promise((resolve) => {
    db.run(
      `
      UPDATE break_times
      SET
        site_id = ?,
        break_name = ?,
        work_type = ?,
        start_time = ?,
        end_time = ?,
        break_minutes = ?,
        is_paid = ?,
        is_active = ?,
        memo = ?
      WHERE id = ?
      `,
      [
        site_id,
        break_name,
        work_type,
        start_time,
        end_time,
        break_minutes,
        is_paid,
        is_active,
        memo,
        id,
      ],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(
          NextResponse.json({
            message: "휴게시간이 수정되었습니다.",
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
      DELETE FROM break_times
      WHERE id = ?
      `,
      [id],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(
          NextResponse.json({
            message: "휴게시간이 삭제되었습니다.",
          })
        );
      }
    );
  });
}