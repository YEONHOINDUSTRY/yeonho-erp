import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      "SELECT * FROM settlements ORDER BY id DESC",
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

  return new Promise((resolve) => {
    db.get(
      "SELECT id FROM settlements WHERE settlement_month = ?",
      [body.settlementMonth],
      (checkErr, existingRow: any) => {
        if (checkErr) {
          resolve(
            NextResponse.json({ error: checkErr.message }, { status: 500 })
          );
          return;
        }

        if (existingRow) {
          resolve(
            NextResponse.json(
              {
                success: false,
                duplicate: true,
                message: "이미 해당 정산월의 정산내역이 존재합니다.",
              },
              { status: 409 }
            )
          );
          return;
        }

        db.run(
          `
          INSERT INTO settlements (
            settlement_month,
            total_qty,
            production_amount,
            manager_stop_hours,
            manager_stop_amount,
            worker_stop_hours,
            worker_stop_amount,
            transport_cost,
            final_amount
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            body.settlementMonth,
            body.totalQty,
            body.productionAmount,
            body.managerStopHours,
            body.managerStopAmount,
            body.workerStopHours,
            body.workerStopAmount,
            body.transportCost,
            body.finalAmount,
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
                success: true,
                id: this.lastID,
              })
            );
          }
        );
      }
    );
  });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  return new Promise((resolve) => {
    db.run("DELETE FROM settlements WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(
        NextResponse.json({
          success: true,
        })
      );
    });
  });
}