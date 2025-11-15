import { NextResponse } from "next/server";
import { getProducts } from "@/lib/controllers/products";

export async function GET(req: Request) {
  const result = await getProducts(req);
  
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
