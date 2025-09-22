import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );

  const user = await getUserByEmail(email);
  if (!user || user.password !== password)
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );

  return NextResponse.json({
    success: true,
    name: user.name,
    income: user.income,
  });
}
