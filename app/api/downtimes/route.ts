import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateWorkTime } from "@/lib/timeCalc";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM downtimes ORDER BY work_date DESC, id DESC",
      [],
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
    db.all(
      `
      SELECT start_time, end_time
      FROM break_times
      WHERE site_id = ?
        AND is_active = 1
      ORDER BY start_time ASC
      `,
      [body.site_id],
      (breakErr, breakRows: any[]) => {
        if (breakErr) {
          resolve(NextResponse.json({ error: breakErr.message }, { status: 500 }));
          return;
        }

        const result = calculateWorkTime(
          body.start_time,
          body.end_time,
          breakRows
        );

        db.run(
          `
          INSERT INTO downtimes
          (
            site_id,
            work_date,
            line_name,
            start_time,
            end_time,
            total_minutes,
            break_minutes,
            payable_minutes,
            downtime_type,
            reason,
            memo
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            body.site_id,
            body.work_date,
            body.line_name,
            body.start_time,
            body.end_time,
            result.totalMinutes,
            result.breakMinutes,
            result.인정분,
            body.downtime_type,
            body.reason,
            body.memo,
          ],
          function (err) {
            if (err) {
              resolve(NextResponse.json({ error: err.message }, { status: 500 }));
              return;
            }

            resolve(
              NextResponse.json({
                success: true,
                id: this.lastID,
                total_minutes: result.totalMinutes,
                break_minutes: result.breakMinutes,
                payable_minutes: result.인정분,
                total_hours: result.totalHours,
                break_hours: result.breakHours,
                payable_hours: result.인정시간,
              })
            );
          }
        );
      }
    );
  });
}