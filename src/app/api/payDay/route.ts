import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  putUser,
  getUserExpenses,
  addExpense,
} from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { email, newIncome } = await req.json();

  const user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const totalUsed =
    user.monthSavings +
    user.monthInvestment +
    user.monthExpensesNecessity +
    user.monthExpensesDiscretionary;

  user.totalSavings += Number(user.income) - totalUsed;
  user.monthSavings = 0;
  user.monthInvestment = 0;
  user.monthExpensesNecessity = 0;
  user.monthExpensesDiscretionary = 0;
  user.income = String(newIncome);

  await putUser(user);

  const expenses = await getUserExpenses(email);
  for (const exp of expenses) {
    if (exp.cycle) {
      exp.cycle = false;
      await addExpense(exp); // Rewrites with cycle = false
    }
  }

  return NextResponse.json({ success: true, income: user.income });
}
