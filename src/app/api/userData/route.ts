/** -------------  /api/userData/route.ts ------------- */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/* ---------- data file paths ---------- */
const usersPath = path.resolve(process.cwd(), "data/users.json");
const expensesPath = path.resolve(process.cwd(), "data/expenses.json");
const notificationsPath = path.resolve(
  process.cwd(),
  "data/notifications.json"
);

/* ---------- TypeScript interfaces ---------- */
interface User {
  name: string;
  email: string;
  income: string;
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
  /* other fields allowed */
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

interface Notification {
  id: string;
  useremail: string;
  message: string;
  createdAt: string;
}

/* ---------- POST handler ---------- */
export async function POST(req: NextRequest) {
  const { useremail }: { useremail: string } = await req.json();

  /* --- read JSON files --- */
  const users: User[] = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  const expenses: Expense[] = fs.existsSync(expensesPath)
    ? JSON.parse(fs.readFileSync(expensesPath, "utf-8"))
    : [];

  const notifications: Notification[] = fs.existsSync(notificationsPath)
    ? JSON.parse(fs.readFileSync(notificationsPath, "utf-8"))
    : [];

  /* --- find matching user --- */
  const user = users.find((u) => u.email === useremail);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  /* --- filter expenses & notifications for this user --- */
  const userExpenses = expenses.filter((e) => e.useremail === useremail);
  const userNotifications = notifications.filter(
    (n) => n.useremail === useremail
  );

  /* --- return all data --- */
  return NextResponse.json({
    user,
    expenses: userExpenses,
    notifications: userNotifications,
  });
}
