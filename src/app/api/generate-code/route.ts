import { NextResponse } from "next/server";
import { codeGenerator } from "@/lib/code/generator";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const elements = body?.elements;

    if (!Array.isArray(elements)) {
      return NextResponse.json(
        { error: "Invalid payload: `elements` must be an array." },
        { status: 400 },
      );
    }

    // Optional safety check to avoid extremely large payloads
    if (elements.length > 5000) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 },
      );
    }

    const code = await codeGenerator.generateToJSX(elements);

    return NextResponse.json({ code }, { status: 200 });
  } catch (err) {
    console.error("Server code generation failed:", err);
    return NextResponse.json(
      { error: "Code generation failed on the server." },
      { status: 500 },
    );
  }
}
