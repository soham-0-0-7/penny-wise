import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
// import { randomUUID } from "crypto";

/* ---------- paths ---------- */
const usersPath = path.resolve(process.cwd(), "data/users.json");
const expensesPath = path.resolve(process.cwd(), "data/expenses.json");

interface User {
  email: string;
  income: string; // stored as string
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
}

interface Expense {
  id: string;
  useremail: string;
  reason: string;
  category: string;
  description: string;
  amount: number;
  createdAt: string;
  cycle: boolean;
}

/* ---------- POST ---------- */
export async function POST(req: NextRequest) {
  const { useremail, newIncome } = (await req.json()) as {
    useremail: string;
    newIncome: number;
  };

  /* ---- read files ---- */
  const users: User[] = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const expenses: Expense[] = JSON.parse(
    fs.readFileSync(expensesPath, "utf-8")
  );

  const user = users.find((u) => u.email === useremail);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  /* ---- 1. calculate leftover & add to totalSavings ---- */
  const totalMonthUsed =
    user.monthSavings +
    user.monthInvestment +
    user.monthExpensesNecessity +
    user.monthExpensesDiscretionary;

  const leftover = Number(user.income) - totalMonthUsed;
  user.totalSavings += leftover;

  /* ---- 2. reset monthly fields ---- */
  user.monthSavings = 0;
  user.monthInvestment = 0;
  user.monthExpensesNecessity = 0;
  user.monthExpensesDiscretionary = 0;

  /* ---- 3. update income ---- */
  user.income = String(newIncome);

  /* ---- 5. flip cycle of all user expenses ---- */
  expenses.forEach((exp) => {
    if (exp.useremail === useremail && exp.cycle) {
      exp.cycle = false;
    }
  });

  /* ---- persist ---- */
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  fs.writeFileSync(expensesPath, JSON.stringify(expenses, null, 2));

  return NextResponse.json({
    success: true,
    income: user.income, // send back new income for client
  });
}
