export const runtime = "edge";

import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/controllers/categories";

export async function GET(req: Request) {
  const result = await getCategoryBySlug(req);

  if (result.success) {
    return NextResponse.json(result.data, { status: result.statusCode });
  } else {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.details && { details: result.details }),
      },
      { status: result.statusCode }
    );
  }
}
