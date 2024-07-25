'use client'
import AddEditTender from "@/app/(admin)/tenders";
import React from "react";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function TenderEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditTender id={params.id as number}/>
  );
}
