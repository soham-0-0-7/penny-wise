// Updated API Route
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "data/users.json");

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password }: { email: string; password: string } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    const usersRaw = fs.readFileSync(filePath, "utf-8");
    const users: User[] = JSON.parse(usersRaw);

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      name: user.name,
      income: user.income,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
