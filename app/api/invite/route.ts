import { NextRequest, NextResponse } from "next/server";
import { getFamilyByToken } from "@/lib/supabase/families";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }
  const family = await getFamilyByToken(token);
  if (!family) {
    return NextResponse.json({ error: "invalid token" }, { status: 404 });
  }
  return NextResponse.json({ familyId: family.id, familyName: family.name });
}
