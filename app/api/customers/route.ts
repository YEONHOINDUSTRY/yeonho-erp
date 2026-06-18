import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all("SELECT * FROM customers ORDER BY id DESC", [], (err, rows) => {
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
  const { name, manager, phone, memo } = body;

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO customers (name, manager, phone, memo)
      VALUES (?, ?, ?, ?)
      `,
      [name, manager, phone, memo],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(
          NextResponse.json({
            id: this.lastID,
            name,
            manager,
            phone,
            memo,
          })
        );
      }
    );
  });
}
export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  return new Promise((resolve) => {
    db.run("DELETE FROM customers WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json({ success: true }));
    });
  });
}