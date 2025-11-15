import { NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/controllers/orders";

export async function POST(req: Request) {
  const result = await createOrder(req);
  
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

export async function GET(req: Request) {
  const result = await getOrders(req);
  
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
