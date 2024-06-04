'use client'
import AddEditNews from "@/app/(admin)/news";
import React from "react";

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
      <AddEditNews id={params.id as number}/>
  );
}
