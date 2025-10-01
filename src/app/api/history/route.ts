import { NextRequest, NextResponse } from "next/server";
import { adminAuth, db } from "@/db/firebase-admin";
import { firestore } from "firebase-admin";
import FieldValue = firestore.FieldValue;

export const runtime = "nodejs";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HistoryRequestBody {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
  responseStatus: number;
  requestSize?: number;
  responseSize?: number;
  duration?: number;
  errorDetails?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const userId = decoded.uid;

    const body: HistoryRequestBody = await req.json();

    await db.collection("history").add({
      userId,
      method: body.method,
      url: body.url,
      headers: body.headers ?? {},
      body: body.body,
      responseStatus: body.responseStatus,
      requestSize: body.requestSize ?? 0,
      responseSize: body.responseSize ?? 0,
      duration: body.duration ?? 0,
      errorDetails: body.errorDetails ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ ok: false, message: errorMsg }, { status: 500 });
  }
}
