import { NextRequest, NextResponse } from "next/server";
import { deleteNotification, getUserNotifications } from "@/utils/db-helpers";

export async function POST(req: NextRequest) {
  const { id, email }: { id: string; email: string } = await req.json();

  const notifs = await getUserNotifications(email);
  const exists = notifs.some((n) => n.id === id);
  if (!exists)
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 }
    );

  await deleteNotification(id);
  return NextResponse.json({ success: true });
}
