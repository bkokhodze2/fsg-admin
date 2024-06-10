'use client'

import React from "react";
import AddEditJobVacancy from "@/app/(admin)/job-vacancy";


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
      <AddEditJobVacancy id={params.id as number}/>
  );
}
