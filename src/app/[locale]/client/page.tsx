"use client";

import React, { lazy, Suspense } from "react";
import Loader from "@/components/ui/Loader";

const RestClient = lazy(() => import("@/components/client/RestClient"));

export default function RestClientPage() {
  return (
    <Suspense fallback={<Loader />}>
      <RestClient />
    </Suspense>
  );
}
