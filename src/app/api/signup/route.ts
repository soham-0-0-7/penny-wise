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
  const { name, email, password, income } = (await req.json()) as {
    name: string;
    email: string;
    password: string;
    income: string;
  };

  /* -------- ensure users.json exists -------- */
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "[]", "utf-8");
  }

  const users: User[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (users.find((u) => u.email === email)) {
    return NextResponse.json({ error: "User already exists, try login." });
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const newUser: User = {
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

  users.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  return NextResponse.json({ success: true, name, income });
}
