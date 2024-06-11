'use client'
import AddEditFaq from "@/app/(admin)/faq";
import React from "react";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function FaqEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditFaq id={params.id as number}/>
  );
}
