import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { getSession } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, folder = "courses" } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    // Sanitize folder
    const safeFolder = ["courses", "thumbnails", "avatars", "general"].includes(folder) ? folder : "courses";

    // Generate unique key
    const extension = filename.split(".").pop() || "jpg";
    const key = `${safeFolder}/${session.user.id}-${nanoid(12)}.${extension}`;

    const result = await getPresignedUrl(key, contentType);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      url: result.url,
      publicUrl: result.publicUrl,
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
