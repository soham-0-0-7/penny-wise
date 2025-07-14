import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const notificationsPath = path.resolve(
  process.cwd(),
  "data/notifications.json"
);

interface Notification {
  id: string;
  useremail: string;
  message: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  const { id, useremail }: { id: string; useremail: string } = await req.json();

  let notifications: Notification[] = JSON.parse(
    fs.readFileSync(notificationsPath, "utf-8")
  );
  notifications = notifications.filter(
    (n) => !(n.id === id && n.useremail === useremail)
  );

  fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2));
  return NextResponse.json({ success: true });
}
