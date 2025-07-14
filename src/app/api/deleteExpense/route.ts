import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersPath = path.resolve(process.cwd(), "data/users.json");
const expensesPath = path.resolve(process.cwd(), "data/expenses.json");

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

interface User {
  email: string;
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
}

export async function POST(req: NextRequest) {
  const { id, useremail }: { id: string; useremail: string } = await req.json();

  let expenses: Expense[] = JSON.parse(fs.readFileSync(expensesPath, "utf-8"));
  const users: User[] = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

  const expense = expenses.find(
    (e) => e.id === id && e.useremail === useremail
  );
  if (!expense)
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  const user = users.find((u) => u.email === useremail);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  switch (expense.category) {
    case "savings":
      user.monthSavings -= expense.amount;
      user.totalSavings -= expense.amount;
      break;
    case "investment":
      user.monthInvestment -= expense.amount;
      user.totalInvestment -= expense.amount;
      break;
    case "expense (necessity)":
      user.monthExpensesNecessity -= expense.amount;
      break;
    case "expense (discretionary)":
      user.monthExpensesDiscretionary -= expense.amount;
      break;
  }

  expenses = expenses.filter((e) => e.id !== id);
  fs.writeFileSync(expensesPath, JSON.stringify(expenses, null, 2));
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  return NextResponse.json({ success: true });
}
