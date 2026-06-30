import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM workers ORDER BY id DESC",
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

export async function POST(req: NextRequest) {
  const body = await req.json();

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO workers
      (
        site_id,
        worker_name,
        nationality,
        position,
        phone,
        hire_date
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        body.site_id,
        body.worker_name,
        body.nationality,
        body.position,
        body.phone,
        body.hire_date,
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
            success: true,
            id: this.lastID,
          })
        );
      }
    );
  });
}