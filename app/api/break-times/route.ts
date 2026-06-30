import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT
        break_times.id,
        break_times.site_id,
        sites.name AS site_name,
        break_times.break_name,
        break_times.work_type,
        break_times.start_time,
        break_times.end_time,
        break_times.break_minutes,
        break_times.is_paid,
        break_times.is_active,
        break_times.memo,
        break_times.created_at
      FROM break_times
      LEFT JOIN sites
      ON sites.id = break_times.site_id
      ORDER BY break_times.id DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          resolve(
            NextResponse.json(
              { error: err.message },
              { status: 500 }
            )
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
      INSERT INTO break_times (
        site_id,
        break_name,
        work_type,
        start_time,
        end_time,
        break_minutes,
        is_paid,
        is_active,
        memo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ],
      function (err) {
        if (err) {
          resolve(
            NextResponse.json(
              { error: err.message },
              { status: 500 }
            )
          );
          return;
        }

        resolve(
          NextResponse.json({
            id: this.lastID,
            message: "휴게시간이 등록되었습니다.",
          })
        );
      }
    );
  });
}