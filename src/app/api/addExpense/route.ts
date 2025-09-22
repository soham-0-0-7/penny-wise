import { NextRequest, NextResponse } from "next/server";
import {
  addExpense,
  addNotification,
  getUserByEmail,
  putUser,
} from "@/utils/db-helpers";
import { Expense, Notification } from "@/utils/db-helpers";
import crypto from "crypto";

// Income brackets
const limits = [
  { max: 20000, pct: { nec: 65, dis: 5, sav: 15, inv: 15 } },
  { max: 50000, pct: { nec: 55, dis: 10, sav: 15, inv: 20 } },
  { max: 100000, pct: { nec: 45, dis: 10, sav: 15, inv: 30 } },
  { max: 200000, pct: { nec: 40, dis: 10, sav: 10, inv: 40 } },
  { max: Number.MAX_SAFE_INTEGER, pct: { nec: 35, dis: 10, sav: 10, inv: 45 } },
];

function getPct(income: number) {
  return limits.find((l) => income <= l.max)!.pct;
}

export async function POST(req: NextRequest) {
  const { reason, category, description, amount, email } = await req.json();

  if (!reason || !category || !description || !amount || !email)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (amount < 1)
    return NextResponse.json({ error: "Amount must be >= 1" }, { status: 400 });

  const user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const date = new Date().toISOString().split("T")[0];

  const newExpense: Expense = {
    id: crypto.randomUUID(),
    email,
    reason,
    category,
    description,
    amount,
    createdAt: date,
    cycle: true,
  };

  await addExpense(newExpense);

  // Update user fields
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

  const incomeNum = Number(user.income);
  const pct = getPct(incomeNum);
  const checks = [
    {
      used: user.monthExpensesNecessity,
      allowedPct: pct.nec,
      label: "expense (necessity)",
    },
    {
      used: user.monthExpensesDiscretionary,
      allowedPct: pct.dis,
      label: "expense (discretionary)",
    },
    { used: user.monthSavings, allowedPct: pct.sav, label: "savings" },
    { used: user.monthInvestment, allowedPct: pct.inv, label: "investment" },
  ];

  const exceeded = checks.find(
    (c) =>
      c.label === category &&
      c.used > Math.round((c.allowedPct / 100) * incomeNum)
  );

  if (exceeded) {
    const notif: Notification = {
      id: crypto.randomUUID(),
      email,
      createdAt: date,
      message: `Your expenditure on ${exceeded.label} has exceeded the limit; please tone down on it.`,
    };
    await addNotification(notif);
  }

  await putUser(user);
  return NextResponse.json({ success: true });
}
