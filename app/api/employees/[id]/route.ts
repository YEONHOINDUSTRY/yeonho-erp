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
    employee_name,
    nationality,
    phone,
    position,
    work_type,
    hourly_wage,
    monthly_salary,
    hire_date,
    resign_date,
    is_active,
    memo,
  } = body;

  return new Promise((resolve) => {
    db.run(
      `
      UPDATE employees
      SET
        site_id = ?,
        employee_name = ?,
        nationality = ?,
        phone = ?,
        position = ?,
        work_type = ?,
        hourly_wage = ?,
        monthly_salary = ?,
        hire_date = ?,
        resign_date = ?,
        is_active = ?,
        memo = ?
      WHERE id = ?
      `,
      [
        site_id,
        employee_name,
        nationality,
        phone,
        position,
        work_type,
        hourly_wage,
        monthly_salary,
        hire_date,
        resign_date,
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
            message: "직원 정보가 수정되었습니다.",
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
      DELETE FROM employees
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
            message: "직원 정보가 삭제되었습니다.",
          })
        );
      }
    );
  });
}