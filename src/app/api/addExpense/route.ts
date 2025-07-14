import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

type Category =
  | "expense (necessity)"
  | "expense (discretionary)"
  | "savings"
  | "investment";

// ──────────────────────── Utility Functions ────────────────────────
function ensureFile<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  const raw = fs.readFileSync(filePath, "utf-8") || JSON.stringify(fallback);
  return JSON.parse(raw) as T;
}

function saveFile<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ──────────────────────── Paths ────────────────────────
const expensesPath = path.resolve(process.cwd(), "data/expenses.json");
const usersPath = path.resolve(process.cwd(), "data/users.json");
const notificationsPath = path.resolve(
  process.cwd(),
  "data/notifications.json"
);

// ──────────────────────── Income Range Table ────────────────────────
interface Limit {
  nec: number;
  dis: number;
  sav: number;
  inv: number;
}

const limits: { max: number; pct: Limit }[] = [
  { max: 20000, pct: { nec: 65, dis: 5, sav: 15, inv: 15 } },
  { max: 50000, pct: { nec: 55, dis: 10, sav: 15, inv: 20 } },
  { max: 100000, pct: { nec: 45, dis: 10, sav: 15, inv: 30 } },
  { max: 200000, pct: { nec: 40, dis: 10, sav: 10, inv: 40 } },
  { max: Number.MAX_SAFE_INTEGER, pct: { nec: 35, dis: 10, sav: 10, inv: 45 } },
];

function getPct(income: number): Limit {
  return limits.find((l) => income <= l.max)!.pct;
}

// ──────────────────────── Types ────────────────────────
interface Expense {
  id: string;
  useremail: string;
  reason: string;
  category: Category;
  description: string;
  amount: number;
  createdAt: string;
  cycle: boolean; // ✅ NEW
}

interface User {
  name: string;
  email: string;
  password: string;
  income: string;
  lastPayDate: string;
  totalSavings: number;
  totalInvestment: number;
  monthSavings: number;
  monthInvestment: number;
  monthExpensesNecessity: number;
  monthExpensesDiscretionary: number;
}

interface Notification {
  id: string;
  useremail: string;
  message: string;
  createdAt: string;
}

// ──────────────────────── POST Handler ────────────────────────
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    reason: string;
    category: Category;
    description: string;
    amount: number;
    useremail: string;
  };

  const { reason, category, description, amount, useremail } = body;

  if (!reason || !category || !description || !amount || !useremail) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (amount < 1) {
    return NextResponse.json({ error: "Amount must be >= 1" }, { status: 400 });
  }

  const expenses = ensureFile<Expense[]>(expensesPath, []);
  const users = ensureFile<User[]>(usersPath, []);
  const notifs = ensureFile<Notification[]>(notificationsPath, []);

  const user = users.find((u) => u.email === useremail);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isoString = new Date().toISOString(); // Example: "2025-07-14T18:24:57.000Z"
  const date = new Date(isoString);

  // Option 1: YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const yyyyMmDd = `${year}-${month}-${day}`;

  // ✅ Add the cycle field as true
  const expense: Expense = {
    id: crypto.randomUUID(),
    useremail,
    reason,
    category,
    description,
    amount,
    createdAt: yyyyMmDd,
    cycle: true,
  };
  expenses.push(expense);
  saveFile(expensesPath, expenses);

  switch (category) {
    case "savings":
      user.monthSavings += amount;
      user.totalSavings += amount;
      break;
    case "investment":
      user.monthInvestment += amount;
      user.totalInvestment += amount;
      break;
    case "expense (discretionary)":
      user.monthExpensesDiscretionary += amount;
      break;
    case "expense (necessity)":
      user.monthExpensesNecessity += amount;
      break;
  }
  saveFile(usersPath, users);

  const incomeNum = Number(user.income);
  const pct = getPct(incomeNum);

  interface Check {
    field: keyof User;
    used: number;
    allowedPct: number;
    label: Category;
  }

  const checks: Check[] = [
    {
      field: "monthExpensesNecessity",
      used: user.monthExpensesNecessity,
      allowedPct: pct.nec,
      label: "expense (necessity)",
    },
    {
      field: "monthExpensesDiscretionary",
      used: user.monthExpensesDiscretionary,
      allowedPct: pct.dis,
      label: "expense (discretionary)",
    },
    {
      field: "monthSavings",
      used: user.monthSavings,
      allowedPct: pct.sav,
      label: "savings",
    },
    {
      field: "monthInvestment",
      used: user.monthInvestment,
      allowedPct: pct.inv,
      label: "investment",
    },
  ];

  const exceeded = checks.find(
    (c) =>
      c.label === category &&
      c.used > Math.round((c.allowedPct / 100) * incomeNum)
  );

  if (exceeded) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      useremail,
      createdAt: yyyyMmDd,
      message: `Your expenditure on ${exceeded.label} has exceeded the limit; please tone down on it.`,
    };
    notifs.push(notification);
    saveFile(notificationsPath, notifs);
  }

  return NextResponse.json({ success: true });
}
