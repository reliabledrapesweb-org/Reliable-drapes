import { NextResponse } from "next/server";
import { login, signup } from "@/lib/controllers/auth";
import { HTTP_STATUS } from "@/lib/types/controllers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (!action || !["signup", "login"].includes(action)) {
      return NextResponse.json(
        { error: 'Missing/invalid action. Use "signup" or "login".' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    let result;
    if (action === "signup") {
      result = await signup(body);
    } else if (action === "login") {
      result = await login(body);
    } else {
      NextResponse.json(
        { error: "Invalid action" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (result?.success) {
      return NextResponse.json(result?.data, { status: result?.statusCode });
    } else {
      return NextResponse.json(
        {
          error: result?.error,
          ...(result?.details && { details: result?.details }),
        },
        { status: result?.statusCode }
      );
    }
  } catch (err) {
    console.error("/api/auth error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
