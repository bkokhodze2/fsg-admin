'use client'
import AddEditNews from "@/app/(admin)/news";
import React, { Suspense } from "react";

export default function CsrAdd() {
  return (
    <Suspense fallback={"loading..."}>
      <AddEditNews isCsr  />
    </Suspense>
  );
}
