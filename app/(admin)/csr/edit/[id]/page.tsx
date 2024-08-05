'use client'
import AddEditNews from "@/app/(admin)/news";
import React, { Suspense } from "react";

interface IPageProps {
    params: {
      id: string | number
    },
    searchParams: {
      id: number
    }
  }

export default function CsrEdit({params, searchParams}: IPageProps) {
  return (
    <Suspense fallback={"loading..."}>
      <AddEditNews isCsr id={params.id as number} />
    </Suspense>
  );
}