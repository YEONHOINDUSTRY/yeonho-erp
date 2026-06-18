import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all("SELECT * FROM items ORDER BY id DESC", [], (err, rows) => {
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
  const { itemNo, itemName, customerName, unitPrice } = body;

  return new Promise((resolve) => {
    db.run(
      `
      INSERT INTO items (item_no, item_name, customer_name, unit_price)
      VALUES (?, ?, ?, ?)
      `,
      [itemNo, itemName, customerName, unitPrice],
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
    db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
      if (err) {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        return;
      }

      resolve(NextResponse.json({ success: true }));
    });
  });
}