import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "R2 presigned upload endpoint will be implemented in Phase 3." },
    { status: 501 },
  );
}
