import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  let sql = "SELECT * FROM productions";
  const params: any[] = [];

  if (month) {
    sql += " WHERE work_date LIKE ?";
    params.push(`${month}%`);
  }

  sql += " ORDER BY work_date DESC, id DESC";

  return new Promise((resolve) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json(rows));
    });
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const {
    workDate,
    lineName,
    itemNo,
    itemName,
    customerName,
    unitPrice,
    quantity,
    worker,
    memo,
  } = body;

  const amount = Number(quantity) * Number(unitPrice);

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO productions
      (work_date, line_name, item_no, item_name, customer_name, unit_price, quantity, amount, worker, memo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        workDate,
        lineName,
        itemNo,
        itemName,
        customerName,
        unitPrice,
        quantity,
        amount,
        worker,
        memo,
      ],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(NextResponse.json({ success: true, id: this.lastID }));
      }
    );
  });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  return new Promise((resolve) => {
    db.run("DELETE FROM productions WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json({ success: true }));
    });
  });
}