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

export default function NewsEdit({params, searchParams}: IPageProps) {


  return (
    <Suspense fallback={"loading..."}>
      <AddEditNews id={params.id as number}/>
    </Suspense>
  );
}
