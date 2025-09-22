import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  getUserExpenses,
  getUserNotifications,
} from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const expenses = await getUserExpenses(email);
  const notifications = await getUserNotifications(email);

  return NextResponse.json({ user, expenses, notifications });
}
