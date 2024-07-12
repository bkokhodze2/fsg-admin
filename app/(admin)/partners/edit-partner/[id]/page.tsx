'use client'
import React from "react";
import AddEditPartner from "../../add-partner";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function EditPartner({params, searchParams}: IPageProps) {
  return (
      <AddEditPartner id={params.id as number}/>
  );
}
