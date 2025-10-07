"use server";

import { cookies } from "next/headers";
import { adminAuth, db } from "@/db/firebase-admin";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/loader";
import React from "react";

export type HistoryItem = {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
  duration?: number;
  responseStatus?: number;
  requestSize?: number;
  responseSize?: number;
  errorDetails?: string | null;
};

const HistoryClient = dynamic<{ history: HistoryItem[] }>(
  () => import("@/components/history/history-client"),
  {
    loading: () => <Loader />,
  }
);

export default async function HistoryPage() {
  const token: string | undefined = (await cookies()).get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifyIdToken(token);
  const userId: string = decoded.uid;

  const snapshot = await db
    .collection("history")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  const history: HistoryItem[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      method: data.method,
      url: data.url,
      headers: data.headers ?? {},
      body: data.body,
      createdAt: data.createdAt.toDate().toISOString(),
      duration: data.duration,
      responseStatus: data.responseStatus,
      requestSize: data.requestSize,
      responseSize: data.responseSize,
      errorDetails: data.errorDetails ?? null,
    };
  });

  return <HistoryClient history={history} />;
}
