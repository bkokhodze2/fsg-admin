'use client'
import AddEditNews from "@/app/(admin)/news";
import React, { Suspense } from "react";

export default function NewsAdd() {
  return (
    <Suspense fallback={"loading..."}>
      <AddEditNews/>
    </Suspense>
  );
}
