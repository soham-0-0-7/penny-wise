import { NextRequest, NextResponse } from "next/server";
import {
  deleteExpense,
  getUserByEmail,
  putUser,
  getUserExpenses,
} from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { id, email }: { id: string; email: string } = await req.json();

  const user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const expenses = await getUserExpenses(email);
  const expense = expenses.find((e) => e.id === id);
  if (!expense)
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });

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

  await putUser(user);
  await deleteExpense(id);

  return NextResponse.json({ success: true });
}
