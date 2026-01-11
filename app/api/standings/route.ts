import { NextResponse } from "next/server";
import { getStandings } from "@/lib/standings.server";

export async function GET() {
  const data = await getStandings();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
