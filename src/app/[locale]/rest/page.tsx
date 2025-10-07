"use client";

import React, { lazy, Suspense } from "react";
import Loader from "@/components/ui/loader";

const RestClient = lazy(() => import("@/components/rest/rest-client"));

export default function RestClientPage() {
  return (
    <Suspense fallback={<Loader />}>
      <RestClient />
    </Suspense>
  );
}
