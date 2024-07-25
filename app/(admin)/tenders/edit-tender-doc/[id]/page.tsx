'use client'
import React from "react";
import AddEditTenderDoc from "../../add-tender-doc";

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
      <AddEditTenderDoc id={params.id as number}/>
  );
}
