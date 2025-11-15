export const runtime = "edge";

import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/controllers/categories";

export async function GET(req: Request) {
  const result = await getCategories(req);

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

export async function POST(req: Request) {
  const result = await createCategory(req);

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
