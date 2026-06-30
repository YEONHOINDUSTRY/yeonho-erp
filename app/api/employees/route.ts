import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT
        employees.id,
        employees.site_id,
        sites.name AS site_name,
        employees.employee_name,
        employees.nationality,
        employees.phone,
        employees.position,
        employees.work_type,
        employees.hourly_wage,
        employees.monthly_salary,
        employees.hire_date,
        employees.resign_date,
        employees.is_active,
        employees.memo,
        employees.created_at
      FROM employees
      LEFT JOIN sites ON sites.id = employees.site_id
      ORDER BY employees.id DESC
      `,
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

export async function POST(request: Request) {
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
      INSERT INTO employees (
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
        memo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ],
      function (err) {
        if (err) {
          resolve(NextResponse.json({ error: err.message }, { status: 500 }));
          return;
        }

        resolve(
          NextResponse.json({
            id: this.lastID,
            message: "직원이 등록되었습니다.",
          })
        );
      }
    );
  });
}