import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, putUser } from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { name, email, password, income } = await req.json();

  const existingUser = await getUserByEmail(email);
  if (existingUser)
    return NextResponse.json({ error: "User already exists, try login." });

  const today = new Date().toISOString().split("T")[0];

  const newUser = {
    name,
    email,
    password,
    income,
    lastPayDate: today,
    totalSavings: 0,
    totalInvestment: 0,
    monthSavings: 0,
    monthInvestment: 0,
    monthExpensesNecessity: 0,
    monthExpensesDiscretionary: 0,
  };

  await putUser(newUser);
  return NextResponse.json({ success: true, name, income });
}
